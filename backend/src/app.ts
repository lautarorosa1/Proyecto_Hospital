import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { container } from './container';
import { errorHandler } from './shared/errorHandler';
import facturacionRoutes from './modules/facturacion/facturacion.routes';

export function createApp() {
  console.log('ENTRANDO EN CREATE APP');

  const app = express();

  app.use(cors());
  app.use(express.json());
  // Express 5 deja req.body en undefined si no llega un JSON: se normaliza
  app.use((req: Request, _res: Response, next: NextFunction) => {
    req.body ??= {};
    next();
  });

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

  // Admisión confirma el traslado a internación (publica PACIENTE_INGRESADO)
  app.use('/ingresos-internacion', container.ingresoInternacionModule.routes);

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

  app.use(
    '/atencion-enfermeria/administraciones',
    container.atencionEnfermeriaModule.administracionesRoutes
  );

  // Historia clínica: alergias y línea de tiempo del paciente
  app.use('/alergias', container.historiaClinicaModule.routes);
  app.use('/historia-clinica', container.historiaClinicaModule.eventosRoutes);

  // Facturación y Administración (Back-Office)
  app.use('/api/facturacion', facturacionRoutes);

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
  });

  app.use(errorHandler);

  return app;
}