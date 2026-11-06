
import { Router } from 'express';
import { NotaEnfermeriaController } from './NotaEnfermeriaController';

export function createNotaEnfermeriaRoutes(
  controller: NotaEnfermeriaController
): Router {
  const router = Router();

  router.get('/', controller.getAll);
  router.get('/:id', controller.getById);
  router.post('/', controller.create);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.remove);

  return router;
}