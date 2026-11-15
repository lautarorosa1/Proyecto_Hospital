import type { EstadoCama } from './EstadoCama';

export interface Cama {
  id: number;
  habitacion_id: number;
  estado: EstadoCama;
}

export interface CamaMapa extends Cama {
  sector: string;
}
