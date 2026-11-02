import { Router } from 'express';
import { GuardiaController } from './GuardiaController';
import { AlertasGuardiaStream } from './AlertasGuardiaStream';

export function createGuardiaRoutes(
  guardiaController: GuardiaController,
  alertasStream: AlertasGuardiaStream,
): Router {
  const router = Router();

  router.get('/alertas/stream', alertasStream.suscribir);

  router.get('/cola', guardiaController.getCola);
  router.post('/ingresos', guardiaController.registrarIngreso);
  router.get('/ingresos/:id', guardiaController.getIngreso);

  return router;
}
