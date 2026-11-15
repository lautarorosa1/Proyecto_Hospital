import { TipoMovimiento } from '../../domain/TipoMovimiento';

export interface ResponseMovimientoInventarioDto {
  id: number;
  insumo_id: number;
  tipo: TipoMovimiento;
  cantidad: number;
  referencia_id: number;
  fecha_hora: string;
}