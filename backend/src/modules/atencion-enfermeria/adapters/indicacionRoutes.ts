import { Router } from 'express';
import { IndicacionController } from './IndicacionController';

export const createIndicacionRoutes = (
  controller: IndicacionController
) => {
  const router = Router();

  // Registrar una indicación
  router.post('/', (req, res) => controller.crear(req, res));

  // Listar todas las indicaciones
  router.get('/', (req, res) => controller.listar(req, res));

  // Buscar indicaciones por internación
  router.get('/internacion/:internacionId', (req, res) =>
    controller.listarPorInternacion(req, res)
  );

  // Actualizar una indicación
  router.put('/:id', (req, res) => controller.actualizar(req, res));

  return router;
};