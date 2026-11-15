import { Router } from 'express';
import { ProtocoloController } from './ProtocoloController';

export function createProtocoloRoutes(
  protocoloController: ProtocoloController
): Router {
  const router = Router();

  router.get('/', protocoloController.getAll);
  // Protocolos generados al ingresar a una internación (antes de "/:id")
  router.get('/internacion/:internacionId', protocoloController.getByInternacion);
  router.get('/:id', protocoloController.getById);

  router.post('/', (req, res, next) => {
    console.log('LLEGÓ UNA PETICIÓN POST A PROTOCOLOS');
    protocoloController.create(req, res, next);
  });

  router.put('/:id', protocoloController.update);
  router.delete('/:id', protocoloController.remove);

  return router;
}