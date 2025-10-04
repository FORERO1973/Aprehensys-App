
'use client';

import type { Apprehension } from '@/lib/types';
import { Map, Marker, ZoomControl, Overlay } from 'pigeon-maps';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { X } from 'lucide-react';

interface AggregatedData {
  municipality: string;
  totalValue: number;
  lat: number;
  lng: number;
  count: number;
  classification?: string;
}


// Function to calculate the center of the map based on data points
const getCenter = (data: Apprehension[] | AggregatedData[]) => {
  if (data.length === 0) {
    return { center: [7.8939, -72.5078] as [number, number], zoom: 10 }; // Default to Cúcuta
  }

  const lats = data.map(d => d.lat);
  const lngs = data.map(d => d.lng);
  
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const center: [number, number] = [(minLat + maxLat) / 2, (minLng + maxLng) / 2];

  // Calculate zoom level
  const latDiff = maxLat - minLat;
  const lngDiff = maxLng - minLng;
  const maxDiff = Math.max(latDiff, lngDiff);
  
  let zoom = 10;
  if (maxDiff > 0) {
    zoom = Math.floor(Math.log2(360 / maxDiff)) -1;
  }
  
  if (data.length === 1) {
    zoom = 13;
  }


  return { center, zoom: Math.min(zoom, 18) }; // Cap zoom at 18
};

const mapTilerProvider = (x: number, y: number, z: number, dpr?: number) => {
  return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`
}

export function InteractiveMap({ data, isAggregated }: { data: Apprehension[], isAggregated: boolean }) {
  const [selectedMarker, setSelectedMarker] = useState<AggregatedData | null>(null);

  const aggregatedData = useMemo(() => {
    if (isAggregated) {
      const byMunicipality = data.reduce((acc, item) => {
        if (!acc[item.municipality]) {
          acc[item.municipality] = {
            municipality: item.municipality,
            totalValue: 0,
            lat: item.lat,
            lng: item.lng,
            count: 0
          };
        }
        acc[item.municipality].totalValue += item.commercialValue;
        acc[item.municipality].count += 1;
        return acc;
      }, {} as Record<string, AggregatedData>);
      return Object.values(byMunicipality);
    }
    // Convert individual items to the AggregatedData structure for consistent handling
    return data.map(item => ({
        municipality: item.address, // Show address for individual markers
        totalValue: item.commercialValue,
        lat: item.lat,
        lng: item.lng,
        classification: item.classification,
        count: 1
    }));
  }, [data, isAggregated]);

  const { center, zoom } = useMemo(() => getCenter(aggregatedData), [aggregatedData]);
  
  return (
    <div className="h-full w-full rounded-lg overflow-hidden relative">
      <Map
        provider={mapTilerProvider}
        dprs={[1, 2]}
        height={500}
        center={center}
        zoom={zoom}
        onClick={() => setSelectedMarker(null)}
      >
        <ZoomControl />
        {aggregatedData.map((item, index) => (
          <Marker
            key={`${item.municipality}-${index}`}
            width={30}
            anchor={[item.lat, item.lng]}
            color={'#9333ea'}
            onClick={(event) => {
                event.event.stopPropagation();
                setSelectedMarker(item)
            }}
          />
        ))}

        {selectedMarker && (
          <Overlay anchor={[selectedMarker.lat, selectedMarker.lng]} offset={[0, -15]}>
            <div className="w-64">
              <Card className="shadow-xl">
                <CardHeader className="flex-row items-start justify-between p-3">
                  <div className="space-y-1">
                    <CardTitle className="text-base capitalize">{isAggregated ? selectedMarker.municipality.toLowerCase() : selectedMarker.classification}</CardTitle>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedMarker(null); }} className="p-1 rounded-full hover:bg-muted -mt-1 -mr-1">
                      <X className="h-4 w-4" />
                  </button>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <p className="text-sm font-bold">
                    {new Intl.NumberFormat('es-CO', {
                      style: 'currency',
                      currency: 'COP',
                      minimumFractionDigits: 0,
                    }).format(selectedMarker.totalValue)}
                  </p>
                  {isAggregated ? (
                     <p className="text-xs text-muted-foreground mt-1">{selectedMarker.count} aprehensiones</p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1">{selectedMarker.municipality}</p>
                  )
                }
                </CardContent>
              </Card>
            </div>
          </Overlay>
        )}
      </Map>
    </div>
  );
}
