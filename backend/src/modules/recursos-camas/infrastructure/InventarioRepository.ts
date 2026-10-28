import { DataSource } from 'typeorm';
import type { Insumo } from '../domain/Insumo';
import type { IInventarioRepository, ResultadoStock } from '../domain/IInventarioRepository';
import type { MovimientoInventario } from '../domain/MovimientoInventario';
import type { TipoMovimiento } from '../domain/TipoMovimiento';
import { InsumoEntity } from './InsumoEntity';
import { MovimientoInventarioEntity } from './MovimientoInventarioEntity';

export class InventarioRepository implements IInventarioRepository {
  constructor(private readonly dataSource: DataSource) {}

  private aIso(fecha: Date | string): string {
    return fecha instanceof Date ? fecha.toISOString() : new Date(fecha).toISOString();
  }

  private aInsumo(entity: InsumoEntity): Insumo {
    return {
      id: entity.id,
      nombre: entity.nombre,
      stock_actual: entity.stock_actual,
      unidad_medida: entity.unidad_medida,
    };
  }

  private aMovimiento(entity: MovimientoInventarioEntity): MovimientoInventario {
    return {
      id: entity.id,
      insumo_id: entity.insumo_id,
      tipo: entity.tipo as TipoMovimiento,
      cantidad: entity.cantidad,
      referencia_id: entity.referencia_id,
      fecha_hora: this.aIso(entity.fecha_hora),
    };
  }

  private async aplicar(
    insumoId: number,
    cantidad: number,
    referenciaId: number,
    tipo: TipoMovimiento,
  ): Promise<ResultadoStock> {
    return this.dataSource.transaction<ResultadoStock>(async (manager) => {
      const insumo = await manager.findOne(InsumoEntity, {
        where: { id: insumoId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!insumo) return { ok: false, fallo: 'no_encontrado' };

      if (tipo === 'Descuento' && insumo.stock_actual - cantidad < 0) {
        return { ok: false, fallo: 'stock_insuficiente' };
      }

      insumo.stock_actual =
        tipo === 'Descuento' ? insumo.stock_actual - cantidad : insumo.stock_actual + cantidad;

      const guardado = await manager.save(insumo);
      const movimiento = await manager.save(
        manager.create(MovimientoInventarioEntity, {
          insumo_id: insumo.id,
          tipo,
          cantidad,
          referencia_id: referenciaId,
          fecha_hora: new Date(),
        }),
      );

      return {
        ok: true,
        insumo: this.aInsumo(guardado),
        movimiento: this.aMovimiento(movimiento),
      };
    });
  }

  async ingresar(input: {
    insumoId: number;
    cantidad: number;
    referenciaId: number;
  }): Promise<ResultadoStock> {
    return this.aplicar(input.insumoId, input.cantidad, input.referenciaId, 'Ingreso');
  }

  async descontar(input: {
    insumoId: number;
    cantidad: number;
    referenciaId: number;
  }): Promise<ResultadoStock> {
    return this.aplicar(input.insumoId, input.cantidad, input.referenciaId, 'Descuento');
  }
}