import type { TipoMovimiento } from './TipoMovimiento';

export interface MovimientoInventario {
  id: number;
  insumo_id: number;
  tipo: TipoMovimiento;
  cantidad: number;
  referencia_id: number;
  fecha_hora: string;
}