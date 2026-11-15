import { Repository } from 'typeorm';
import type {
  NotificacionConsultorio,
  NuevaNotificacion,
} from '../domain/NotificacionConsultorio';
import type { INotificacionRepository } from '../domain/INotificacionRepository';
import { NotificacionConsultorioEntity } from './NotificacionConsultorioEntity';

export class NotificacionRepository implements INotificacionRepository {
  constructor(private readonly repo: Repository<NotificacionConsultorioEntity>) {}

  private toDomain(e: NotificacionConsultorioEntity): NotificacionConsultorio {
    return {
      id: e.id,
      profesionalId: e.profesionalId,
      tipo: e.tipo,
      titulo: e.titulo,
      mensaje: e.mensaje,
      referenciaId: e.referenciaId ?? undefined,
      leida: e.leida,
      creadaEn: e.creadaEn,
    };
  }

  async crear(data: NuevaNotificacion): Promise<NotificacionConsultorio> {
    const guardada = await this.repo.save(this.repo.create({ ...data, leida: false }));
    return this.toDomain(guardada);
  }

  async listar(
    profesionalId: number,
    opciones: { soloNoLeidas?: boolean; limite?: number },
  ): Promise<NotificacionConsultorio[]> {
    const filas = await this.repo.find({
      where: opciones.soloNoLeidas ? { profesionalId, leida: false } : { profesionalId },
      order: { creadaEn: 'DESC', id: 'DESC' },
      take: opciones.limite ?? 50,
    });
    return filas.map((f) => this.toDomain(f));
  }

  async contarNoLeidas(profesionalId: number): Promise<number> {
    return this.repo.countBy({ profesionalId, leida: false });
  }

  async marcarLeida(id: number, profesionalId: number): Promise<boolean> {
    const r = await this.repo.update({ id, profesionalId }, { leida: true });
    return (r.affected ?? 0) > 0;
  }

  async marcarTodasLeidas(profesionalId: number): Promise<number> {
    const r = await this.repo.update({ profesionalId, leida: false }, { leida: true });
    return r.affected ?? 0;
  }
}
