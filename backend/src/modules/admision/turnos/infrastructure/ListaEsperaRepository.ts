import { Repository } from 'typeorm';
import type { EsperaTurno, NuevaEspera } from '../domain/ListaEspera';
import type { IListaEsperaRepository } from '../domain/IListaEsperaRepository';
import { EsperaTurnoEntity } from './EsperaTurnoEntity';

export class ListaEsperaRepository implements IListaEsperaRepository {
  constructor(private readonly repo: Repository<EsperaTurnoEntity>) {}

  private toDomain(e: EsperaTurnoEntity): EsperaTurno {
    return {
      id: e.id,
      profesionalId: e.profesionalId,
      pacienteId: e.pacienteId,
      fecha: e.fecha,
      estado: e.estado,
      turnoId: e.turnoId ?? undefined,
      creadoEn: e.creadoEn,
    };
  }

  async crear(data: NuevaEspera): Promise<EsperaTurno> {
    const saved = await this.repo.save(
      this.repo.create({ ...data, estado: 'en_espera' }),
    );
    return this.toDomain(saved);
  }

  async findEnEspera(profesionalId: number, fecha: string): Promise<EsperaTurno[]> {
    return this.findAllEnEspera({ profesionalId, fecha });
  }

  async findAllEnEspera(filtros: {
    profesionalId?: number;
    fecha?: string;
  }): Promise<EsperaTurno[]> {
    const qb = this.repo
      .createQueryBuilder('e')
      .where('e.estado = :estado', { estado: 'en_espera' })
      .orderBy('e.creadoEn', 'ASC')
      .addOrderBy('e.id', 'ASC');
    if (filtros.profesionalId !== undefined) {
      qb.andWhere('e.profesionalId = :p', { p: filtros.profesionalId });
    }
    if (filtros.fecha !== undefined) {
      qb.andWhere('e.fecha = :f', { f: filtros.fecha });
    }
    return (await qb.getMany()).map((e) => this.toDomain(e));
  }

  async reclamarPrimero(
    profesionalId: number,
    fecha: string,
  ): Promise<EsperaTurno | null> {
    // El UPDATE con subconsulta FOR UPDATE SKIP LOCKED desencola de forma
    // atómica: dos cancelaciones concurrentes reclaman pacientes distintos.
    const filas: { id: number }[] = await this.repo.query(
      `UPDATE lista_espera_turnos SET estado = 'asignado'
       WHERE id = (
         SELECT id FROM lista_espera_turnos
         WHERE profesional_id = $1 AND fecha = $2 AND estado = 'en_espera'
         ORDER BY creado_en ASC, id ASC
         LIMIT 1
         FOR UPDATE SKIP LOCKED
       )
       RETURNING id`,
      [profesionalId, fecha],
    );
    // RETURNING desde UPDATE puede venir como [filas, cantidad] según el driver.
    const lista = Array.isArray(filas[0]) ? (filas[0] as unknown as { id: number }[]) : filas;
    if (!lista.length) return null;
    const entity = await this.repo.findOneByOrFail({ id: lista[0].id });
    return this.toDomain(entity);
  }

  async registrarTurno(id: number, turnoId: number): Promise<void> {
    await this.repo.update({ id }, { turnoId });
  }

  async devolver(id: number): Promise<void> {
    await this.repo.update({ id }, { estado: 'en_espera', turnoId: null });
  }

  async descartar(id: number): Promise<void> {
    await this.repo.update({ id }, { estado: 'descartado' });
  }
}
