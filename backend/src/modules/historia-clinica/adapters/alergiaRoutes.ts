import { Router } from 'express';
import { AlergiaController } from './AlergiaController';

export function createAlergiaRoutes(
  alergiaController: AlergiaController
): Router {
  const router = Router();

  router.get('/paciente/:pacienteId', alergiaController.getByPaciente);

  router.get('/:id', alergiaController.getById);

  router.post('/', alergiaController.create);

  router.put('/:id', alergiaController.update);

  return router;
}