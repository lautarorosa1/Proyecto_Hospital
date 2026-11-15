import { BadRequestError, NotFoundError } from '../../../shared/errors';
import type { INotificacionRepository } from '../domain/INotificacionRepository';
import type {
  NotificacionConsultorio,
  NuevaNotificacion,
} from '../domain/NotificacionConsultorio';
import type { NotificacionDto } from './dtos/ConsultorioDtos';

/** Bandeja de avisos del profesional. `publicar` la empuja en tiempo real (SSE). */
export class NotificacionService {
  constructor(
    private readonly repository: INotificacionRepository,
    private readonly publicar: (n: NotificacionDto) => void = () => {},
  ) {}

  private toDto(n: NotificacionConsultorio): NotificacionDto {
    return {
      id: n.id,
      profesionalId: n.profesionalId,
      tipo: n.tipo,
      titulo: n.titulo,
      mensaje: n.mensaje,
      referenciaId: n.referenciaId,
      leida: n.leida,
      creadaEn: n.creadaEn.toISOString(),
    };
  }

  private exigirId(valor: unknown, campo: string): number {
    if (typeof valor !== 'number' || !Number.isInteger(valor) || valor <= 0) {
      throw new BadRequestError(`${campo} debe ser un entero positivo`);
    }
    return valor;
  }

  /** Guarda el aviso en la bandeja y lo envía al monitor del profesional si está conectado. */
  async notificar(data: NuevaNotificacion): Promise<NotificacionDto> {
    const dto = this.toDto(await this.repository.crear(data));
    try {
      this.publicar(dto);
    } catch (error) {
      console.error('[Consultorio] No se pudo enviar la notificación en tiempo real', error);
    }
    return dto;
  }

  async listar(
    profesionalId: number,
    opciones: { soloNoLeidas?: boolean; limite?: number } = {},
  ): Promise<{ notificaciones: NotificacionDto[]; noLeidas: number }> {
    this.exigirId(profesionalId, 'profesionalId');
    const [lista, noLeidas] = await Promise.all([
      this.repository.listar(profesionalId, opciones),
      this.repository.contarNoLeidas(profesionalId),
    ]);
    return { notificaciones: lista.map((n) => this.toDto(n)), noLeidas };
  }

  async marcarLeida(profesionalId: number, notificacionId: number): Promise<void> {
    this.exigirId(profesionalId, 'profesionalId');
    this.exigirId(notificacionId, 'notificacionId');
    const ok = await this.repository.marcarLeida(notificacionId, profesionalId);
    if (!ok) throw new NotFoundError('Notificación no encontrada');
  }

  async marcarTodasLeidas(profesionalId: number): Promise<{ marcadas: number }> {
    this.exigirId(profesionalId, 'profesionalId');
    return { marcadas: await this.repository.marcarTodasLeidas(profesionalId) };
  }
}
