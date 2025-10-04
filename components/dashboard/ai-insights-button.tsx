'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { generateApprehensionInsights } from '@/ai/flows/generate-apprehension-insights';
import type { Apprehension } from '@/lib/types';
import { Bot, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';

export default function AiInsightsButton({ filteredData }: { filteredData: Apprehension[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState('');
  const { toast } = useToast();

  const handleGenerateInsights = async () => {
    if (filteredData.length === 0) {
        toast({
            variant: "destructive",
            title: "No hay datos",
            description: "No hay datos para analizar. Aplique filtros diferentes.",
          })
      return;
    }
    
    setIsLoading(true);
    setInsights('');

    try {
      const apprehensionData = JSON.stringify(filteredData.slice(0, 50)); // Limit data for performance
      const result = await generateApprehensionInsights({ apprehensionData });
      if (result.insights) {
        setInsights(result.insights);
      } else {
        throw new Error('No se pudieron generar las ideas.');
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error de IA",
        description: "Hubo un problema al generar las ideas. Por favor, inténtelo de nuevo.",
      })
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={handleGenerateInsights}>
          <Bot className="mr-2 h-4 w-4" />
          Obtener Insights con IA
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Insights Generados por IA</DialogTitle>
          <DialogDescription>
            Análisis de tendencias y anomalías en los datos seleccionados.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Analizando datos...</p>
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
              {insights}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
