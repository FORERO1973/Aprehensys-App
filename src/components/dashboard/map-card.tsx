
'use client';

import type { Apprehension } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { InteractiveMap } from './interactive-map';
import { Suspense } from 'react';
import { Skeleton } from '../ui/skeleton';

export function MapCard({ data, isAggregated }: { data: Apprehension[], isAggregated: boolean }) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Ubicación de Aprehensiones</CardTitle>
        <CardDescription>Visualización geográfica de los puntos de aprehensión.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
           <InteractiveMap data={data} isAggregated={isAggregated}/>
        </Suspense>
      </CardContent>
    </Card>
  );
}
