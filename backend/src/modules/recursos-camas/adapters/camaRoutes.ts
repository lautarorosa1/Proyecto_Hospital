import { Router } from 'express';
import { CamaController } from './CamaController';
import { CamasStream } from './CamasStream';

export function createCamaRoutes(
  camaController: CamaController,
  camasStream?: CamasStream,
): Router {
  const router = Router();

  // Monitores en tiempo real: antes de "/:id"
  if (camasStream) router.get('/eventos/stream', camasStream.suscribir);

  router.get('/', camaController.mapa);
  router.post('/', camaController.crear);
  router.get('/:id', camaController.obtener);
  router.post('/:id/asignaciones', camaController.asignar);
  router.post('/:id/limpieza', camaController.pasarAEnLimpieza);
  router.put('/:id/estado', camaController.cambiarEstado);

  return router;
}