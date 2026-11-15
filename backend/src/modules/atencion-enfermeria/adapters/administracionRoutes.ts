import { Router } from 'express';
import { AdministracionController } from './AdministracionController';

export const createAdministracionRoutes = (
  controller: AdministracionController
): Router => {
  const router = Router();

  // Confirmar la administración de una dosis prescrita
  router.post('/', controller.administrar);

  // Dosis administradas por internación
  router.get('/internacion/:internacionId', controller.buscarPorInternacion);

  return router;
};
