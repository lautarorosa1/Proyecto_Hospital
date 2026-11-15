import { Router, type Request, type Response, type NextFunction } from 'express';
import { ConsultorioController } from './ConsultorioController';

type Suscribir = (req: Request, res: Response, next: NextFunction) => void;

export function createConsultorioRoutes(
  controller: ConsultorioController,
  streams: { profesional: Suscribir; estado: Suscribir },
): Router {
  const router = Router();

  // Consultorios (habitaciones de tipo CONSULTORIO) y su ocupación
  router.get('/habitaciones', controller.consultorios);
  router.get('/habitaciones/stream', streams.estado); // tiempo real: quién ocupa cada sala
  router.post('/ocupaciones', controller.abrir);

  // Todo lo del profesional
  const p = '/profesionales/:profesionalId';
  router.get(`${p}/ocupacion`, controller.ocupacionActual);
  router.post(`${p}/ocupacion/cerrar`, controller.cerrar);

  router.get(`${p}/agenda`, controller.getAgenda);
  router.get(`${p}/sala-espera`, controller.getSalaEspera);
  router.post(`${p}/turnos/:turnoId/atender`, controller.atender);

  router.get(`${p}/notificaciones`, controller.getNotificaciones);
  router.post(`${p}/notificaciones/leer-todas`, controller.leerTodas);
  router.post(`${p}/notificaciones/:notificacionId/leer`, controller.leerNotificacion);

  // Tiempo real del profesional: `notificacion` y `ocupacion`
  router.get(`${p}/stream`, streams.profesional);

  return router;
}
