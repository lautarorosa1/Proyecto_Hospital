import { Repository } from 'typeorm';
import type { EventoClinico, NuevoEventoClinico } from '../domain/EventoClinico';
import type { IEventoClinicoRepository } from '../domain/IEventoClinicoRepository';
import { EventoClinicoEntity } from './EventoClinicoEntity';

export class EventoClinicoRepository implements IEventoClinicoRepository {
  constructor(private readonly repo: Repository<EventoClinicoEntity>) {}

  private toDomain(e: EventoClinicoEntity): EventoClinico {
    return {
      id: e.id,
      pacienteId: e.pacienteId,
      tipo: e.tipo,
      resumen: e.resumen,
      referenciaId: e.referenciaId ?? undefined,
      alerta: e.alerta,
      fecha: e.fecha,
    };
  }

  async create(data: NuevoEventoClinico): Promise<EventoClinico> {
    const saved = await this.repo.save(this.repo.create(data));
    return this.toDomain(saved);
  }

  async findByPacienteId(pacienteId: number): Promise<EventoClinico[]> {
    const filas = await this.repo.find({
      where: { pacienteId },
      order: { fecha: 'DESC', id: 'DESC' },
    });
    return filas.map((f) => this.toDomain(f));
  }
}
