import { DataSource, IsNull } from 'typeorm';
import type { AsignacionCama } from '../domain/AsignacionCama';
import type { Cama, CamaMapa } from '../domain/Cama';
import {
  esEstadoCama,
  transicionDirectaPermitida,
  transicionPermitida,
  type EstadoCama,
} from '../domain/EstadoCama';
import type { HistorialEstadoCama } from '../domain/HistorialEstadoCama';
import type { ICamaRepository, ResultadoCambioCama } from '../domain/ICamaRepository';
import { AsignacionCamaEntity } from './AsignacionCamaEntity';
import { CamaEntity } from './CamaEntity';
import { HabitacionEntity } from './HabitacionEntity';
import { HistorialEstadoCamaEntity } from './HistorialEstadoCamaEntity';

type FilaMapa = {
  id: number | string;
  numero: string;
  habitacion_id: number | string;
  estado: string;
  version: number | string;
  sector: string;
};

export class CamaRepository implements ICamaRepository {
  constructor(private readonly dataSource: DataSource) {}

  private aEstado(valor: string): EstadoCama {
    if (!esEstadoCama(valor)) {
      throw new Error(`Estado de cama inválido: ${valor}`);
    }
    return valor;
  }

  private aIso(fecha: Date | string): string {
    return fecha instanceof Date ? fecha.toISOString() : new Date(fecha).toISOString();
  }

  private aEntero(valor: number | string): number {
    const numero = typeof valor === 'number' ? valor : Number(valor);
    if (!Number.isInteger(numero)) {
      throw new Error('Identificador de cama inválido');
    }
    return numero;
  }

  private aCama(entity: CamaEntity): Cama {
    return {
      id: entity.id,
      numero: entity.numero,
      habitacion_id: entity.habitacion_id,
      estado: this.aEstado(entity.estado),
      version: entity.version,
    };
  }

  private aHistorial(entity: HistorialEstadoCamaEntity): HistorialEstadoCama {
    return {
      id: entity.id,
      cama_id: entity.cama_id,
      estado_anterior: this.aEstado(entity.estado_anterior),
      estado_nuevo: this.aEstado(entity.estado_nuevo),
      fecha_cambio: this.aIso(entity.fecha_cambio),
      usuario_id: entity.usuario_id,
    };
  }

  private aAsignacion(entity: AsignacionCamaEntity): AsignacionCama {
    return {
      id: entity.id,
      cama_id: entity.cama_id,
      paciente_id: entity.paciente_id,
      fecha_asignacion: this.aIso(entity.fecha_asignacion),
      fecha_liberacion: entity.fecha_liberacion ? this.aIso(entity.fecha_liberacion) : null,
    };
  }

  async crear(data: { numero: string; habitacion_id: number }): Promise<Cama> {
    const repo = this.dataSource.getRepository(CamaEntity);
    const entity = repo.create({
      numero: data.numero,
      habitacion_id: data.habitacion_id,
      estado: 'Libre',
      version: 0,
    });
    const saved = await repo.save(entity);
    return this.aCama(saved);
  }

  async buscarPorId(id: number): Promise<Cama | null> {
    const entity = await this.dataSource.getRepository(CamaEntity).findOneBy({ id });
    return entity ? this.aCama(entity) : null;
  }

  async buscarMapa(filtro: { estado?: EstadoCama; sector?: string }): Promise<CamaMapa[]> {
    const qb = this.dataSource
      .getRepository(CamaEntity)
      .createQueryBuilder('cama')
      .innerJoin(HabitacionEntity, 'habitacion', 'habitacion.id = cama.habitacion_id')
      .select('cama.id', 'id')
      .addSelect('cama.numero', 'numero')
      .addSelect('cama.habitacion_id', 'habitacion_id')
      .addSelect('cama.estado', 'estado')
      .addSelect('cama.version', 'version')
      .addSelect('habitacion.sector', 'sector')
      .orderBy('cama.id', 'ASC');

    if (filtro.estado !== undefined) {
      qb.andWhere('cama.estado = :estado', { estado: filtro.estado });
    }
    if (filtro.sector !== undefined) {
      qb.andWhere('habitacion.sector = :sector', { sector: filtro.sector });
    }

    const filas = await qb.getRawMany<FilaMapa>();
    return filas.map((fila) => ({
      id: this.aEntero(fila.id),
      numero: fila.numero,
      habitacion_id: this.aEntero(fila.habitacion_id),
      estado: this.aEstado(fila.estado),
      version: this.aEntero(fila.version),
      sector: fila.sector,
    }));
  }

  async asignar(input: {
    camaId: number;
    pacienteId: number;
    usuarioId: number;
    version: number;
  }): Promise<ResultadoCambioCama> {
    return this.dataSource.transaction<ResultadoCambioCama>(async (manager) => {
      const cama = await manager.findOne(CamaEntity, {
        where: { id: input.camaId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!cama) return { ok: false, fallo: 'no_encontrada' };
      if (cama.version !== input.version) return { ok: false, fallo: 'version' };

      const estadoActual = this.aEstado(cama.estado);
      if (estadoActual !== 'Libre' || !transicionPermitida(estadoActual, 'Ocupada')) {
        return { ok: false, fallo: 'transicion' };
      }

      const abierta = await manager.findOne(AsignacionCamaEntity, {
        where: { cama_id: cama.id, fecha_liberacion: IsNull() },
        lock: { mode: 'pessimistic_write' },
      });
      if (abierta) return { ok: false, fallo: 'doble_asignacion' };

      const ahora = new Date();
      cama.estado = 'Ocupada';
      cama.version = cama.version + 1;
      const camaGuardada = await manager.save(cama);

      const historial = await manager.save(
        manager.create(HistorialEstadoCamaEntity, {
          cama_id: cama.id,
          estado_anterior: estadoActual,
          estado_nuevo: 'Ocupada',
          fecha_cambio: ahora,
          usuario_id: input.usuarioId,
        }),
      );

      const asignacion = await manager.save(
        manager.create(AsignacionCamaEntity, {
          cama_id: cama.id,
          paciente_id: input.pacienteId,
          fecha_asignacion: ahora,
          fecha_liberacion: null,
        }),
      );

      return {
        ok: true,
        cama: this.aCama(camaGuardada),
        historial: this.aHistorial(historial),
        asignacion: this.aAsignacion(asignacion),
      };
    });
  }

  async cambiarEstado(input: {
    camaId: number;
    estadoNuevo: EstadoCama;
    usuarioId: number;
    version: number;
  }): Promise<ResultadoCambioCama> {
    return this.dataSource.transaction<ResultadoCambioCama>(async (manager) => {
      const cama = await manager.findOne(CamaEntity, {
        where: { id: input.camaId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!cama) return { ok: false, fallo: 'no_encontrada' };
      if (cama.version !== input.version) return { ok: false, fallo: 'version' };

      const estadoActual = this.aEstado(cama.estado);
      if (!transicionDirectaPermitida(estadoActual, input.estadoNuevo)) {
        return { ok: false, fallo: 'transicion' };
      }

      const ahora = new Date();
      let asignacionCerrada: AsignacionCamaEntity | null = null;
      if (input.estadoNuevo === 'En limpieza') {
        const abiertas = await manager.find(AsignacionCamaEntity, {
          where: { cama_id: cama.id, fecha_liberacion: IsNull() },
          lock: { mode: 'pessimistic_write' },
        });
        for (const abierta of abiertas) {
          abierta.fecha_liberacion = ahora;
          asignacionCerrada = await manager.save(abierta);
        }
      }

      cama.estado = input.estadoNuevo;
      cama.version = cama.version + 1;
      const camaGuardada = await manager.save(cama);

      const historial = await manager.save(
        manager.create(HistorialEstadoCamaEntity, {
          cama_id: cama.id,
          estado_anterior: estadoActual,
          estado_nuevo: input.estadoNuevo,
          fecha_cambio: ahora,
          usuario_id: input.usuarioId,
        }),
      );

      return {
        ok: true,
        cama: this.aCama(camaGuardada),
        historial: this.aHistorial(historial),
        asignacion: asignacionCerrada ? this.aAsignacion(asignacionCerrada) : null,
      };
    });
  }
}