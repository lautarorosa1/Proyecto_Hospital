import { Router } from 'express';
import { EstudioMedicoController } from './EstudioMedicoController';

export function createEstudioMedicoRoutes(
  controller: EstudioMedicoController
): Router {
  const router = Router();

  router.get('/paciente/:pacienteId', controller.getByPaciente);
  router.get('/:id', controller.getById);
  router.post('/', controller.create);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.delete);

  return router;
}