
'use client';

import { Bar, BarChart, CartesianGrid, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import type { Apprehension } from '@/lib/types';
import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <p className="font-bold">{label}</p>
        <p className="text-sm text-muted-foreground">{`Cantidad: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

export function ClassificationChart({ data }: { data: Apprehension[] }) {
  const chartData = useMemo(() => {
    const classificationCounts = data.reduce((acc, item) => {
      acc[item.classification] = (acc[item.classification] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(classificationCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  const COLORS = useMemo(() => {
    return chartData.map((_, index) => `hsl(${index * 40}, 70%, 50%)`);
  }, [chartData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clasificación de Aprehensiones</CardTitle>
        <CardDescription>Distribución de los tipos de delitos.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" hide />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              axisLine={false}
              width={100}
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {chartData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

const formatNumber = (value: number) => new Intl.NumberFormat('es-CO').format(value);


const PieCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <p className="font-bold">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground">
            {`Aprehensiones: ${formatNumber(payload[0].value)}`}
          </p>
        </div>
      );
    }
    return null;
  };

export function ValueByOriginChart({ data }: { data: Apprehension[] }) {
  const chartData = useMemo(() => {
    const countByOrigin = data.reduce((acc, item) => {
      acc[item.origin] = (acc[item.origin] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(countByOrigin).map(([name, value]) => ({ name, value }));
  }, [data]);
  
  const COLORS = useMemo(() => {
    return chartData.map((_, index) => `hsl(${index * 137.5}, 70%, 50%)`);
  }, [chartData]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Aprehensiones por Origen</CardTitle>
        <CardDescription>Número de aprehensiones según su origen.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Tooltip content={<PieCustomTooltip />} />
            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={{ fontSize: 11 }}>
              {chartData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend iconSize={10} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
