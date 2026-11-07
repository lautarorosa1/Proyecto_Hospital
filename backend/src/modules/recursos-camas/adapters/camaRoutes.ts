import { Router } from 'express';
import { CamaController } from './CamaController';

export function createCamaRoutes(camaController: CamaController): Router {
  const router = Router();

  router.get('/', camaController.mapa);
  router.post('/', camaController.crear);
  router.get('/:id', camaController.obtener);
  router.post('/:id/asignaciones', camaController.asignar);
  router.post('/:id/limpieza', camaController.pasarAEnLimpieza);
  router.put('/:id/estado', camaController.cambiarEstado);

  return router;
}