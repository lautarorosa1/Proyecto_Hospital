import { Router } from 'express';
import { HabitacionController } from './HabitacionController';

export function createHabitacionRoutes(habitacionController: HabitacionController): Router {
  const router = Router();

  router.get('/', habitacionController.getAll);
  router.get('/:id', habitacionController.getById);
  router.post('/', habitacionController.create);
  router.put('/:id', habitacionController.update);
  router.delete('/:id', habitacionController.remove);

  return router;
}