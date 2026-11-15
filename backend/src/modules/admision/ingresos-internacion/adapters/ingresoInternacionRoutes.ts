import { Router } from 'express';
import { IngresoInternacionController } from './IngresoInternacionController';

export function createIngresoInternacionRoutes(
  controller: IngresoInternacionController,
): Router {
  const router = Router();
  router.post('/', controller.confirmar);
  return router;
}
