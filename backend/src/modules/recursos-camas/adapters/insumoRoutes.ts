import { Router } from 'express';
import { InsumoController } from './InsumoController';

export function createInsumoRoutes(insumoController: InsumoController): Router {
  const router = Router();

  router.get('/', insumoController.getAll);
  router.get('/stock', insumoController.consultarStock);
  router.get('/:id/stock', insumoController.consultarStockPorId);
  router.get('/:id', insumoController.getById);
  router.post('/', insumoController.create);
  router.post('/:id/ingresos', insumoController.ingresar);
  router.put('/:id', insumoController.update);
  router.delete('/:id', insumoController.remove);

  return router;
}