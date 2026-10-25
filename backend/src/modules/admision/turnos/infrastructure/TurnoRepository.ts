import { In, Repository } from 'typeorm';
import type { EstadoTurno, NuevoTurno, Turno } from '../domain/Turno';
import type { AjusteTurno, TurnoAjustado } from '../domain/Entreturno';
import type {
  FiltrosTurno,
  ITurnoRepository,
} from '../domain/ITurnoRepository';
import { TurnoEntity } from './TurnoEntity';

export class TurnoRepository implements ITurnoRepository {
  constructor(private readonly repo: Repository<TurnoEntity>) {}

  private toDomain = (entity: TurnoEntity): Turno => ({
    id: entity.id,
    profesionalId: entity.profesionalId,
    pacienteId: entity.pacienteId ?? undefined,
    fecha: entity.fecha,
    horaInicio: entity.horaInicio,
    duracionMin: entity.duracionMin,
    estado: entity.estado,
    version: entity.version,
    esEntreturno: entity.esEntreturno,
    duracionOriginalMin: entity.duracionOriginalMin ?? undefined,
    reducidoPorEntreturnoId: entity.reducidoPorEntreturnoId ?? undefined,
  });

  async findAll(filtros: FiltrosTurno = {}): Promise<Turno[]> {
    const qb = this.repo.createQueryBuilder('t');

    if (filtros.profesionalId !== undefined) {
      qb.andWhere('t.profesionalId = :profesionalId', {
        profesionalId: filtros.profesionalId,
      });
    }
    if (filtros.pacienteId !== undefined) {
      qb.andWhere('t.pacienteId = :pacienteId', {
        pacienteId: filtros.pacienteId,
      });
    }
    if (filtros.fecha !== undefined) {
      qb.andWhere('t.fecha = :fecha', { fecha: filtros.fecha });
    }
    if (filtros.fechaDesde !== undefined) {
      qb.andWhere('t.fecha >= :fechaDesde', { fechaDesde: filtros.fechaDesde });
    }
    if (filtros.fechaHasta !== undefined) {
      qb.andWhere('t.fecha <= :fechaHasta', { fechaHasta: filtros.fechaHasta });
    }
    if (filtros.estado !== undefined) {
      qb.andWhere('t.estado = :estado', { estado: filtros.estado });
    }
    if (filtros.desde !== undefined) {
      qb.andWhere(
        '(t.fecha > :dFecha OR (t.fecha = :dFecha AND t.horaInicio >= :dHora))',
        { dFecha: filtros.desde.fecha, dHora: filtros.desde.hora },
      );
    }

    const entities = await qb
      .orderBy('t.fecha', 'ASC')
      .addOrderBy('t.horaInicio', 'ASC')
      .getMany();

    return entities.map(this.toDomain);
  }

  async findById(id: number): Promise<Turno | null> {
    const entity = await this.repo.findOneBy({ id });
    return entity ? this.toDomain(entity) : null;
  }

  async findActivosByProfesionalYFecha(
    profesionalId: number,
    fecha: string,
  ): Promise<Turno[]> {
    const entities = await this.repo
      .createQueryBuilder('t')
      .where('t.profesionalId = :profesionalId', { profesionalId })
      .andWhere('t.fecha = :fecha', { fecha })
      .andWhere('t.estado <> :cancelado', { cancelado: 'cancelado' })
      .orderBy('t.horaInicio', 'ASC')
      .getMany();
    return entities.map(this.toDomain);
  }

  async create(data: NuevoTurno): Promise<Turno> {
    const entity = this.repo.create(data);
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async reservar(
    id: number,
    version: number,
    pacienteId: number,
  ): Promise<boolean> {
    // UPDATE condicional: si otro usuario modificó el turno entre la lectura
    // y este punto, la versión ya no coincide y no se actualiza ninguna fila.
    const result = await this.repo
      .createQueryBuilder()
      .update(TurnoEntity)
      .set({
        pacienteId,
        estado: 'programado',
        version: () => 'version + 1',
      })
      .where('id = :id AND version = :version AND estado = :estado', {
        id,
        version,
        estado: 'disponible',
      })
      .execute();

    return result.affected === 1;
  }

  async cambiarEstado(
    id: number,
    desde: EstadoTurno,
    hacia: EstadoTurno,
  ): Promise<boolean> {
    const result = await this.repo
      .createQueryBuilder()
      .update(TurnoEntity)
      .set({ estado: hacia, version: () => 'version + 1' })
      .where('id = :id AND estado = :desde', { id, desde })
      .execute();

    return result.affected === 1;
  }

  async cancelarYLiberar(
    id: number,
    estadoEsperado: EstadoTurno,
  ): Promise<{ cancelado: Turno; liberado: Turno } | null> {
    return this.repo.manager.transaction(async (manager) => {
      const result = await manager
        .createQueryBuilder()
        .update(TurnoEntity)
        .set({ estado: 'cancelado', version: () => 'version + 1' })
        .where('id = :id AND estado = :estadoEsperado', {
          id,
          estadoEsperado,
        })
        .execute();

      if (result.affected !== 1) return null;

      const cancelado = await manager.findOneByOrFail(TurnoEntity, { id });

      // El turno cancelado queda como registro histórico; el horario vuelve
      // a quedar disponible en un slot nuevo.
      const liberado = await manager.save(
        manager.create(TurnoEntity, {
          profesionalId: cancelado.profesionalId,
          fecha: cancelado.fecha,
          horaInicio: cancelado.horaInicio,
          duracionMin: cancelado.duracionMin,
          estado: 'disponible',
        }),
      );

      return {
        cancelado: this.toDomain(cancelado),
        liberado: this.toDomain(liberado),
      };
    });
  }

  async insertarEntreturno(
    data: NuevoTurno,
    planificar: (activos: Turno[]) => AjusteTurno[],
  ): Promise<{ entreturno: Turno; afectados: TurnoAjustado[] }> {
    return this.repo.manager.transaction(async (manager) => {
      // 1) Lock de transacción por (profesional, día): dos entreturnos (o un
      //    entreturno y otro cambio de agenda que use este lock) del mismo
      //    profesional y fecha se ejecutan de a uno. También cubre el caso en
      //    que no hay filas que bloquear (hueco libre en la agenda).
      const claveDia = Number(data.fecha.replace(/-/g, '')); // 20261024 (cabe en int4)
      await manager.query('SELECT pg_advisory_xact_lock($1, $2)', [
        data.profesionalId,
        claveDia,
      ]);

      // 2) Lectura de la agenda con las filas bloqueadas: nadie puede
      //    reservar/cambiar estado de estos turnos hasta el commit.
      const entities = await manager
        .createQueryBuilder(TurnoEntity, 't')
        .setLock('pessimistic_write')
        .where('t.profesionalId = :profesionalId', {
          profesionalId: data.profesionalId,
        })
        .andWhere('t.fecha = :fecha', { fecha: data.fecha })
        .andWhere('t.estado <> :cancelado', { cancelado: 'cancelado' })
        .orderBy('t.horaInicio', 'ASC')
        .getMany();

      // Si el plan no es posible lanza un AppError -> rollback.
      const ajustes = planificar(entities.map(this.toDomain));

      // 3) El entreturno es una fila NUEVA: la secuencia le asigna un ID
      //    propio, no reutiliza ni pisa el de ningún turno existente.
      const entreturno = await manager.save(
        manager.create(TurnoEntity, { ...data, esEntreturno: true }),
      );

      // 4) Los turnos afectados se actualizan en el lugar (mismo ID).
      for (const a of ajustes) {
        await manager
          .createQueryBuilder()
          .update(TurnoEntity)
          .set({
            horaInicio: a.horaInicio,
            duracionMin: a.duracionMin,
            // se conserva la duración original de la primera reducción
            duracionOriginalMin: a.turno.duracionOriginalMin ?? a.turno.duracionMin,
            reducidoPorEntreturnoId: entreturno.id,
            version: () => 'version + 1',
          })
          .where('id = :id', { id: a.turno.id })
          .execute();
      }

      const despues = ajustes.length
        ? await manager.findBy(TurnoEntity, {
            id: In(ajustes.map((a) => a.turno.id)),
          })
        : [];
      const porId = new Map(despues.map((e) => [e.id, e]));

      return {
        entreturno: this.toDomain(entreturno),
        afectados: ajustes.map((a) => ({
          antes: a.turno,
          despues: this.toDomain(porId.get(a.turno.id) as TurnoEntity),
        })),
      };
    });
  }
}
