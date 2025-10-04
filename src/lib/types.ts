export interface Apprehension {
  id: string;
  date: string;
  municipality: string;
  address: string;
  commune: string | null;
  classification: string;
  sector: string;
  origin: string;
  commercialValue: number;
  lat: number;
  lng: number;
}
