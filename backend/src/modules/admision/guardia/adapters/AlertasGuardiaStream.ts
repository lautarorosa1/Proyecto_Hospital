import { Request, Response, NextFunction } from 'express';
import type { EventEmitter } from 'node:events';
import {
  EVENTO_ALERTA_RIESGO_VITAL,
  AlertaRiesgoVitalEvento,
} from '../infrastructure/GuardiaNotificador';
import { BadRequestError } from '../../../../shared/errors';

const HEARTBEAT_MS = 25_000;

interface Monitor {
  res: Response;
  /** Si viene, el monitor solo recibe alertas dirigidas a ese médico. */
  profesionalId?: number;
}

/**
 * Canal de alertas en tiempo real hacia los monitores de los médicos de guardia
 * (Server-Sent Events: sin dependencias extra, el front usa `EventSource`).
 *
 *   GET /guardia/alertas/stream                    -> monitor general de la guardia
 *   GET /guardia/alertas/stream?profesionalId=7    -> monitor del médico 7
 */
export class AlertasGuardiaStream {
  private readonly monitores = new Set<Monitor>();

  constructor(bus: EventEmitter) {
    bus.on(EVENTO_ALERTA_RIESGO_VITAL, (e: AlertaRiesgoVitalEvento) =>
      this.difundir(e),
    );
  }

  private difundir(evento: AlertaRiesgoVitalEvento): void {
    const payload = `event: riesgo_vital\ndata: ${JSON.stringify(evento)}\n\n`;
    for (const m of this.monitores) {
      const dirigida =
        m.profesionalId === undefined ||
        evento.medicosDestinatarios.includes(m.profesionalId);
      if (dirigida) m.res.write(payload);
    }
  }

  suscribir = (req: Request, res: Response, next: NextFunction) => {
    try {
      let profesionalId: number | undefined;
      if (typeof req.query.profesionalId === 'string' && req.query.profesionalId) {
        profesionalId = Number(req.query.profesionalId);
        if (!Number.isInteger(profesionalId) || profesionalId <= 0) {
          throw new BadRequestError('profesionalId debe ser un entero positivo');
        }
      }

      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      });
      res.write('retry: 3000\n\n');

      const monitor: Monitor = { res, profesionalId };
      this.monitores.add(monitor);

      // Comentario periódico para que proxies y balanceadores no corten la conexión.
      const heartbeat = setInterval(() => res.write(': ping\n\n'), HEARTBEAT_MS);
      req.on('close', () => {
        clearInterval(heartbeat);
        this.monitores.delete(monitor);
      });
    } catch (err) {
      next(err);
    }
  };
}
