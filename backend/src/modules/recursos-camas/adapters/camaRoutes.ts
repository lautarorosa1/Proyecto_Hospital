import { Router } from 'express';
import {
  authenticateJWT,
  authorizeRoles,
} from '../../iam/adapters/middlewares/authMiddleware';
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
  router.put('/:id/ubicacion', camaController.mover);
  router.post('/:id/asignaciones', camaController.asignar);
  // Ocupada → En limpieza manual: solo Administrador (el alta médica usa liberarPorAlta)
  router.post(
    '/:id/limpieza',
    authenticateJWT,
    authorizeRoles('Administrador'),
    camaController.pasarAEnLimpieza,
  );
  router.put('/:id/estado', camaController.cambiarEstado);

  return router;
}