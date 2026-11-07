import type { EstadoCama } from './EstadoCama';

export interface Cama {
  id: number;
  numero: string;
  habitacion_id: number;
  estado: EstadoCama;
  version: number;
}

export interface CamaMapa extends Cama {
  sector: string;
}