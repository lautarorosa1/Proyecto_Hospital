import { Router } from 'express';
import { PacienteController } from './PacienteController';

export function createPacienteRoutes(pacienteController: PacienteController): Router {
  const router = Router();

  router.get('/', pacienteController.getAll);
  router.get('/:id', pacienteController.getById);
  router.post('/', pacienteController.create);
  router.put('/:id', pacienteController.update);
  router.delete('/:id', pacienteController.remove);

  return router;
}