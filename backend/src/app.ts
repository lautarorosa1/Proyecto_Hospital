import express, { Request, Response } from 'express';
import cors from 'cors';
import { container } from './container';
import { errorHandler } from './shared/errorHandler';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req: Request, res: Response) => res.json({ status: 'ok' }));
  app.use('/pacientes', container.pacienteModule.routes);

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
  });

  app.use(errorHandler); // siempre último

  return app;
}