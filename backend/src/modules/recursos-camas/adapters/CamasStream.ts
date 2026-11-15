import type { Request, Response, NextFunction } from 'express';
import type { IEventBus } from '../../../shared/domain/events/IEventBus';
import { DomainEvents } from '../../../shared/domain/events/DomainEvents';
import { SseChannel } from '../../../shared/infrastructure/sse/SseChannel';

/**
 * Monitores de administración del hospital en tiempo real (Server-Sent Events).
 *
 *   GET /camas/eventos/stream
 *
 * Emite `cama_estado` con cada transición (Libre / Ocupada / En limpieza /
 * Bloqueada) y `cama_asignada` cuando se vincula un paciente.
 */
export class CamasStream {
  private readonly canal = new SseChannel();

  constructor(bus: IEventBus) {
    bus.subscribe(DomainEvents.CAMA_ESTADO_CAMBIADO, (e) =>
      this.canal.difundir('cama_estado', e),
    );
    bus.subscribe(DomainEvents.CAMA_ASIGNADA, (e) =>
      this.canal.difundir('cama_asignada', e),
    );
  }

  suscribir = (req: Request, res: Response, next: NextFunction) =>
    this.canal.suscribir(req, res, next);
}
