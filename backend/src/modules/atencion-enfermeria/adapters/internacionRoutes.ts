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

  // Obtener una internación
  router.get('/:id', (req, res) => controller.obtener(req, res));

  // Alta médica: finaliza la internación y libera la cama
  router.post('/:id/alta', (req, res) => controller.finalizar(req, res));

  return router;
};
