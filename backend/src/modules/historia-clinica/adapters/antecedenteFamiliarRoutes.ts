import { Router } from 'express';
import { AntecedenteFamiliarController } from './AntecedenteFamiliarController';

export function createAntecedenteFamiliarRoutes(
  controller: AntecedenteFamiliarController
): Router {
  const router = Router();

  router.get('/paciente/:pacienteId', controller.getByPaciente);
  router.get('/:id', controller.getById);
  router.post('/', controller.create);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.delete);

  return router;
}