import { Router } from 'express';
import { HorarioController } from './HorarioController';

// Se monta bajo el mismo prefijo que profesionales:
//   app.use('/profesionales', horarioModule.routes)
// y queda como GET/PUT /profesionales/:profesionalId/horarios
export function createHorarioRoutes(horarioController: HorarioController): Router {
  const router = Router();

  router.get('/:profesionalId/horarios', horarioController.getByProfesional);
  router.put('/:profesionalId/horarios', horarioController.guardar);

  return router;
}
