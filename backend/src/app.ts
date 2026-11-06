
import express, { Request, Response } from 'express';
import cors from 'cors';
import { container } from './container';
import { errorHandler } from './shared/errorHandler';

export function createApp() {
  console.log('ENTRANDO EN CREATE APP');

  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req: Request, res: Response) =>
    res.json({ status: 'ok' })
  );

  // Módulos de admisión
  app.use('/pacientes', container.pacienteModule.routes);
  app.use('/profesionales', container.profesionalModule.routes);

  // Atención de enfermería: Protocolos
  console.log('ANTES DE REGISTRAR PROTOCOLOS');

  app.use(
    '/atencion-enfermeria/protocolos',
    container.atencionEnfermeriaModule.routes
  );

  console.log('PROTOCOLOS REGISTRADOS');

  // Atención de enfermería: Notas
  app.use(
    '/atencion-enfermeria/notas',
    container.atencionEnfermeriaModule.notasRoutes
  );

  console.log('NOTAS DE ENFERMERÍA REGISTRADAS');

  // Atención de enfermería: Indicaciones
  app.use(
    '/atencion-enfermeria/indicaciones',
    container.atencionEnfermeriaModule.indicacionesRoutes
  );

  console.log('INDICACIONES REGISTRADAS');

  // Atención de enfermería: Internaciones
  app.use(
    '/atencion-enfermeria/internaciones',
    container.atencionEnfermeriaModule.internacionesRoutes
  );

  console.log('INTERNACIONES REGISTRADAS');

  // Atención de enfermería: Medicaciones
  app.use(
    '/atencion-enfermeria/medicaciones',
    container.atencionEnfermeriaModule.medicacionesRoutes
  );

  console.log('MEDICACIONES REGISTRADAS');

  // Atención de enfermería: Signos Vitales
  app.use(
    '/atencion-enfermeria/signos-vitales',
    container.atencionEnfermeriaModule.signosVitalesRoutes
  );

  console.log('SIGNOS VITALES REGISTRADOS');

  // Ruta para endpoints inexistentes
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Manejo de errores
  app.use(errorHandler);

  return app;
}