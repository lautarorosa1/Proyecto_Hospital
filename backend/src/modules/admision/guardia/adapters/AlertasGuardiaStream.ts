import { Request, Response, NextFunction } from 'express';
import type { IEventBus } from '../../../../shared/domain/events/IEventBus';
import { DomainEvents } from '../../../../shared/domain/events/DomainEvents';
import { BadRequestError } from '../../../../shared/errors';
import { SseChannel } from '../../../../shared/infrastructure/sse/SseChannel';

/** Si viene, el monitor solo recibe alertas dirigidas a ese médico. */
type FiltroMonitor = { profesionalId?: number };

/**
 * Canal de alertas en tiempo real hacia los monitores de los médicos de guardia
 * (Server-Sent Events: sin dependencias extra, el front usa `EventSource`).
 *
 *   GET /guardia/alertas/stream                    -> monitor general de la guardia
 *   GET /guardia/alertas/stream?profesionalId=7    -> monitor del médico 7
 *
 * Emite dos tipos de evento:
 *   - `riesgo_vital`:   triaje Código Rojo en la guardia (Admisión).
 *   - `signos_vitales`: temperatura > 39 °C en un paciente internado (Enfermería).
 */
export class AlertasGuardiaStream {
  private readonly canal = new SseChannel<FiltroMonitor>((req) => {
    if (typeof req.query.profesionalId === 'string' && req.query.profesionalId) {
      const profesionalId = Number(req.query.profesionalId);
      if (!Number.isInteger(profesionalId) || profesionalId <= 0) {
        throw new BadRequestError('profesionalId debe ser un entero positivo');
      }
      return { profesionalId };
    }
    return {};
  });

  constructor(bus: IEventBus) {
    bus.subscribe(DomainEvents.ALERTA_RIESGO_VITAL, (e) =>
      this.canal.difundir(
        'riesgo_vital',
        e,
        (f) =>
          f.profesionalId === undefined ||
          e.medicosDestinatarios.includes(f.profesionalId),
      ),
    );

    // Enfermería → médico de guardia. El modelo no asigna médicos a sectores,
    // así que la alerta llega a todos los monitores de guardia con el sector
    // en el payload para que cada médico identifique si le corresponde.
    bus.subscribe(DomainEvents.SIGNOS_VITALES_ALERTA, (e) =>
      this.canal.difundir('signos_vitales', e),
    );
  }

  suscribir = (req: Request, res: Response, next: NextFunction) =>
    this.canal.suscribir(req, res, next);
}
