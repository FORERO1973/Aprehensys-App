'use client';

import type { Apprehension } from '@/lib/types';
import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import StatCard from '@/components/dashboard/stat-card';
import { DollarSign, GripVertical, Package, Users } from 'lucide-react';
import { ApprehensionsTable } from '@/components/dashboard/apprehensions-table';
import { ClassificationChart, ValueByOriginChart } from '@/components/dashboard/charts';
import { Logo } from '@/components/icons';
import AiInsightsButton from '@/components/dashboard/ai-insights-button';
import { Toaster } from '@/components/ui/toaster';
import { ThemeToggle } from '@/components/dashboard/theme-toggle';
import { MapCard } from '@/components/dashboard/map-card';
import { Loader2 } from 'lucide-react';
import { processCsvData } from '@/lib/csv-parser';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS-MFbrDOwLQxCGKMKLRHZIn16xNjLAvGqeH1fX-FyPUDl8mfwDM-hzN1L0Bs942_Uycf-0FYS2ptWU/pub?gid=1743869807&single=true&output=csv';

export default function Home() {
  const [initialData, setInitialData] = useState<Apprehension[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedMunicipality, setSelectedMunicipality] = useState('all');
  const [selectedCommune, setSelectedCommune] = useState('all');
  const [selectedLeader, setSelectedLeader] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await processCsvData(CSV_URL);
        setInitialData(data);
        setError(null);
      } catch (e: any) {
        console.error("Failed to fetch or process data:", e);
        setError("No se pudieron cargar los datos. Por favor, intente de nuevo más tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const municipalities = useMemo(() => {
    if (initialData.length === 0) return [];
    const allMunicipalities = initialData.map((item) => item.municipality);
    return ['all', ...Array.from(new Set(allMunicipalities))];
  }, [initialData]);

  const communes = useMemo(() => {
    if (selectedMunicipality === 'all' || initialData.length === 0) {
      return ['all'];
    }
    const allCommunes = initialData
      .filter((item) => item.municipality === selectedMunicipality && item.commune)
      .map((item) => item.commune as string);
    return ['all', ...Array.from(new Set(allCommunes))];
  }, [selectedMunicipality, initialData]);

  const leaders = useMemo(() => {
    if (initialData.length === 0) return ['all'];
    const allLeaders = initialData.map((item) => item.leader);
    return ['all', ...Array.from(new Set(allLeaders))];
  }, [initialData]);

  const filteredData = useMemo(() => {
    if (initialData.length === 0) return [];
    return initialData
      .filter((item) => selectedMunicipality === 'all' || item.municipality === selectedMunicipality)
      .filter((item) => selectedCommune === 'all' || item.commune === selectedCommune)
      .filter((item) => selectedLeader === 'all' || item.leader === selectedLeader);
  }, [initialData, selectedMunicipality, selectedCommune, selectedLeader]);

  React.useEffect(() => {
    setSelectedCommune('all');
  }, [selectedMunicipality]);

  const stats = useMemo(() => {
    if (filteredData.length === 0) return { totalValue: 0, totalApprehensions: 0, averageValue: 0, uniqueClassifications: 0 };
    const totalValue = filteredData.reduce((acc, item) => acc + item.commercialValue, 0);
    const totalApprehensions = filteredData.length;
    const averageValue = totalApprehensions > 0 ? totalValue / totalApprehensions : 0;
    const uniqueClassifications = new Set(filteredData.map(item => item.classification)).size;

    return { totalValue, totalApprehensions, averageValue, uniqueClassifications };
  }, [filteredData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando datos del dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive mb-2">Error</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen font-body">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-4 items-center">
            <Logo className="h-8 w-8 text-primary" />
            <h1 className="font-headline text-2xl font-bold tracking-tight">Aprehensys</h1>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
             <AiInsightsButton filteredData={filteredData} />
             <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6 lg:p-8 container">
        <div className="mb-6">
          <h2 className="text-2xl font-headline font-bold tracking-tight mb-4">Dashboard de Aprehensiones</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Filtrar por Municipio</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedMunicipality} onValueChange={setSelectedMunicipality}>
                  <SelectTrigger className="capitalize">
                    <SelectValue placeholder="Seleccione municipio" />
                  </SelectTrigger>
                  <SelectContent>
                    {municipalities.map((m) => (
                      <SelectItem key={m} value={m} className="capitalize">
                        {m === 'all' ? 'Todos los municipios' : m.toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Filtrar por Comuna</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedCommune} onValueChange={setSelectedCommune} disabled={communes.length <= 1}>
                  <SelectTrigger className="capitalize" aria-label="Filtrar por Comuna">
                    <SelectValue placeholder="Seleccione comuna" />
                  </SelectTrigger>
                  <SelectContent>
                    {communes.map((c) => (
                      <SelectItem key={c} value={c} className="capitalize">
                        {c === 'all' ? 'Todas las comunas' : c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Filtrar por Líder del Operativo</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedLeader} onValueChange={setSelectedLeader}>
                  <SelectTrigger className="capitalize">
                    <SelectValue placeholder="Seleccione líder" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaders.map((l) => (
                      <SelectItem key={l} value={l} className="capitalize">
                        {l === 'all' ? 'Todos los líderes' : l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Valor Total" value={stats.totalValue} type="currency" icon={<DollarSign className="h-5 w-5 text-muted-foreground" />} className="bg-blue-100 dark:bg-blue-900/50" />
            <StatCard title="Total Aprehensiones" value={stats.totalApprehensions} icon={<Package className="h-5 w-5 text-muted-foreground" />} className="bg-green-100 dark:bg-green-900/50" />
            <StatCard title="Valor Promedio" value={stats.averageValue} type="currency" icon={<GripVertical className="h-5 w-5 text-muted-foreground" />} className="bg-yellow-100 dark:bg-yellow-900/50" />
            <StatCard title="Clasificaciones" value={stats.uniqueClassifications} icon={<Users className="h-5 w-5 text-muted-foreground" />} className="bg-purple-100 dark:bg-purple-900/50" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
              <ValueByOriginChart data={filteredData} />
            </div>
            <div className="lg:col-span-2">
              <ClassificationChart data={filteredData} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <MapCard data={filteredData} isAggregated={selectedMunicipality === 'all'} />
          </div>

          <div className="grid grid-cols-1 gap-6">
            <ApprehensionsTable data={filteredData} />
          </div>
        </div>
      </main>
    </div>
  );
}
