import type { Apprehension } from './types';
import Papa from 'papaparse';

function parseDate(dateString: string): string {
    if (!dateString) return '2024-01-01';
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      const yearNum = parseInt(year, 10);
      const monthNum = parseInt(month, 10);
      const dayNum = parseInt(day, 10);

      if (!isNaN(dayNum) && !isNaN(monthNum) && !isNaN(yearNum)) {
        const monthStr = String(monthNum).padStart(2, '0');
        const dayStr = String(dayNum).padStart(2, '0');
        const fullYear = yearNum > 2000 ? yearNum : 2000 + yearNum;
        return `${fullYear}-${monthStr}-${dayStr}`;
      }
    }
    if (dateString.match(/^\\d{4}-\\d{2}-\\d{2}/)) {
        return dateString.split(' ')[0];
    }
    return '2024-01-01';
}

export function processCsvData(csvUrl: string): Promise<Apprehension[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(csvUrl, {
      download: true,
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
      complete: (results: Papa.ParseResult<any>, file: string) => {
        try {
          if (results.errors.length > 0) {
            console.error("CSV parsing errors:", results.errors);
          }

          const processedData = (results.data as any[]).map((row: any) => {
            const commercialValue = parseFloat(row.ValorComercial) || 0;
            let municipality = (row.Municipio || 'Desconocido').trim().toUpperCase();

            if (municipality.startsWith('PAMPLONA')) {
              municipality = 'PAMPLONA COLOMBIA';
            }

            const lat = parseFloat(row.Latitude) || 0;
            const lng = parseFloat(row.Longitude) || 0;

            return {
              id: row.ID_DetalleAprehension || '',
              date: parseDate(row.FechaActa),
              municipality: municipality,
              commune: row.ComunaID || null,
              address: row.Direccion || '',
              classification: row.Clasificacion || 'OTROS',
              sector: row.Descripcion || '',
              origin: row.OrigenAprehension || 'Desconocido',
              commercialValue: commercialValue,
              lat: lat,
              lng: lng,
              leader: row.LiderOperativo || 'Desconocido', // Nueva columna para el líder del operativo
            };
          }).filter(item => item.id && item.municipality !== 'DESCONOCIDO' && item.lat !== 0 && item.lng !== 0);

          resolve(processedData as Apprehension[]);
        } catch (error) {
          reject(error);
        }
      },
      error: (error: Error, file: string) => {
        reject(error);
      },
    });
  });
}