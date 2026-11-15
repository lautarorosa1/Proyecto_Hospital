import type { EstadoCama } from './EstadoCama';

export interface HistorialEstadoCama {
  id: number;
  cama_id: number;
  estado_anterior: EstadoCama;
  estado_nuevo: EstadoCama;
  fecha_cambio: string;
  usuario_id: number;
}