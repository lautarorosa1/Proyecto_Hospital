import type { Insumo } from './Insumo';
import type { MovimientoInventario } from './MovimientoInventario';

export type FalloStock = 'no_encontrado' | 'stock_insuficiente';

export type ResultadoStock =
  | { ok: true; insumo: Insumo; movimiento: MovimientoInventario }
  | { ok: false; fallo: FalloStock };

export interface IInventarioRepository {
  ingresar(input: {
    insumoId: number;
    cantidad: number;
    referenciaId: number;
  }): Promise<ResultadoStock>;
  descontar(input: {
    insumoId: number;
    cantidad: number;
    referenciaId: number;
  }): Promise<ResultadoStock>;
}