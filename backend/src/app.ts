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

  app.use('/auth', container.iamModule.routes);
  app.use('/api/v1/iam', container.iamModule.routes);
  app.use('/', container.iamModule.routes);

  app.use('/pacientes', container.pacienteModule.routes);
  app.use('/profesionales', container.profesionalModule.routes);

  app.use('/profesionales', container.horarioModule.routes);
  app.use('/turnos', container.turnoModule.routes);
  app.use('/guardia', container.guardiaModule.routes);

  app.use('/habitaciones', container.recursosCamasModule.habitacionRoutes);
  app.use('/insumos', container.recursosCamasModule.insumoRoutes);
  app.use('/camas', container.recursosCamasModule.camaRoutes);

  app.use(
    '/atencion-enfermeria/protocolos',
    container.atencionEnfermeriaModule.routes
  );

  app.use(
    '/atencion-enfermeria/notas',
    container.atencionEnfermeriaModule.notasRoutes
  );

  app.use(
    '/atencion-enfermeria/indicaciones',
    container.atencionEnfermeriaModule.indicacionesRoutes
  );

  app.use(
    '/atencion-enfermeria/internaciones',
    container.atencionEnfermeriaModule.internacionesRoutes
  );

  app.use(
    '/atencion-enfermeria/medicaciones',
    container.atencionEnfermeriaModule.medicacionesRoutes
  );

  app.use(
    '/atencion-enfermeria/signos-vitales',
    container.atencionEnfermeriaModule.signosVitalesRoutes
  );

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
  });

  app.use(errorHandler);

  return app;
}
