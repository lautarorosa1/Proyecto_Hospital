import { Router } from 'express';
import { ProfesionalController } from './ProfesionalController';

export function createProfesionalRoutes(
  profesionalController: ProfesionalController,
): Router {
  const router = Router();

  router.get('/', profesionalController.getAll);
  router.get('/:id', profesionalController.getById);
  router.post('/', profesionalController.create);
  router.put('/:id', profesionalController.update);
  router.delete('/:id', profesionalController.remove);

  return router;
}
