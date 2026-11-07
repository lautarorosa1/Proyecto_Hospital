
import { Router } from 'express';
import { SignosVitalesController } from './SignosVitalesController';

export function createSignosVitalesRoutes(
  controller: SignosVitalesController
): Router {
  const router = Router();

  // Registrar signos vitales
  router.post('/', controller.registrar);

  // Buscar signos vitales por internación
  router.get('/internacion/:internacionId', controller.buscarPorInternacion);

  // Actualizar signos vitales
  router.put('/:id', controller.actualizar);

  // Eliminar signos vitales
  router.delete('/:id', controller.eliminar);

  // Buscar signos vitales por ID
  router.get('/:id', controller.buscarPorId);

  return router;
}