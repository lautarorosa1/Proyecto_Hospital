import { Router } from 'express';
import { EventoClinicoController } from './EventoClinicoController';

export function createEventoClinicoRoutes(
  controller: EventoClinicoController,
): Router {
  const router = Router();
  router.get('/pacientes/:pacienteId/eventos', controller.getByPaciente);
  return router;
}
