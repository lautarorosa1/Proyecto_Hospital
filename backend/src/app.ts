
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

  // Módulo de admisión y turnos
  app.use('/profesionales', container.horarioModule.routes);
  app.use('/turnos', container.turnoModule.routes);
  app.use('/guardia', container.guardiaModule.routes);

  // Módulo de recursos y camas
  app.use('/habitaciones', container.recursosCamasModule.habitacionRoutes);
  app.use('/insumos', container.recursosCamasModule.insumoRoutes);
  app.use('/camas', container.recursosCamasModule.camaRoutes);

  // Atención de enfermería: Protocolos
  app.use(
    '/atencion-enfermeria/protocolos',
    container.atencionEnfermeriaModule.routes
  );

  // Atención de enfermería: Notas
  app.use(
    '/atencion-enfermeria/notas',
    container.atencionEnfermeriaModule.notasRoutes
  );

  // Atención de enfermería: Indicaciones
  app.use(
    '/atencion-enfermeria/indicaciones',
    container.atencionEnfermeriaModule.indicacionesRoutes
  );

  // Atención de enfermería: Internaciones
  app.use(
    '/atencion-enfermeria/internaciones',
    container.atencionEnfermeriaModule.internacionesRoutes
  );

  // Atención de enfermería: Medicaciones
  app.use(
    '/atencion-enfermeria/medicaciones',
    container.atencionEnfermeriaModule.medicacionesRoutes
  );

  // Atención de enfermería: Signos Vitales
  app.use(
    '/atencion-enfermeria/signos-vitales',
    container.atencionEnfermeriaModule.signosVitalesRoutes
  );

  // Ruta para endpoints inexistentes
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Manejo de errores
  app.use(errorHandler);

  return app;
}
