
import { Router } from 'express';
import { MedicacionController } from './MedicacionController';

export const createMedicacionRoutes = (
  controller: MedicacionController
): Router => {
  const router = Router();

  // Registrar una medicación
  router.post('/', controller.registrar);

  // Consultar todas las medicaciones
  router.get('/', controller.listar);

  // Consultar medicaciones por internación
  router.get('/internacion/:internacionId', controller.buscarPorInternacion);

  // Actualizar una medicación
  router.put('/:id', controller.actualizar);

  return router;
};