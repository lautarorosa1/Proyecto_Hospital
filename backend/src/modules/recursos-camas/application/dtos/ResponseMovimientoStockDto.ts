import { ResponseInsumoDto } from './ResponseInsumoDto';
import { ResponseMovimientoInventarioDto } from './ResponseMovimientoInventarioDto';

export interface ResponseMovimientoStockDto {
  insumo: ResponseInsumoDto;
  movimiento: ResponseMovimientoInventarioDto;
}