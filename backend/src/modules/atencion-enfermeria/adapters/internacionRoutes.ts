
import { Router } from 'express';
import { InternacionController } from './InternacionController';

export const createInternacionRoutes = (
  controller: InternacionController
) => {
  const router = Router();

  // Registrar una internación
  router.post('/', (req, res) => controller.crear(req, res));

  // Listar todas las internaciones
  router.get('/', (req, res) => controller.listar(req, res));

  return router;
};