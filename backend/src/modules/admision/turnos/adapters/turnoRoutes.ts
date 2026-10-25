import { Router } from 'express';
import { TurnoController } from './TurnoController';

export function createTurnoRoutes(turnoController: TurnoController): Router {
  const router = Router();

  // Las rutas fijas van antes que "/:id"
  router.get('/disponibles', turnoController.getDisponibles);

  router.post('/entreturno', turnoController.crearEntreturno);

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
