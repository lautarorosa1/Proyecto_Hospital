import { Router } from 'express';
import { TurnoController } from './TurnoController';
import type { SseChannel } from '../../../../shared/infrastructure/sse/SseChannel';

export function createTurnoRoutes(
  turnoController: TurnoController,
  recepcionStream?: SseChannel,
): Router {
  const router = Router();

  // Las rutas fijas van antes que "/:id"
  router.get('/disponibles', turnoController.getDisponibles);

  router.post('/entreturno', turnoController.crearEntreturno);

  // Lista de espera (standby) y alertas a recepción: antes de "/:id"
  router.get('/espera', turnoController.getEspera);
  router.post('/espera', turnoController.agregarEspera);
  if (recepcionStream) {
    router.get('/espera/alertas/stream', recepcionStream.suscribir);
  }

  router.get('/', turnoController.getAll);
  router.post('/', turnoController.crear);
  router.get('/:id', turnoController.getById);
  router.post('/:id/reservar', turnoController.reservar);
  router.post('/:id/confirmar', turnoController.confirmar);
  router.post('/:id/llegada', turnoController.registrarLlegada);
  router.post('/:id/atender', turnoController.atender);
  router.post('/:id/cancelar', turnoController.cancelar);

  return router;
}
