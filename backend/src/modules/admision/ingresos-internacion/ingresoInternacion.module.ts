import { AppDataSource } from '../../../data-source';
import { eventBus } from '../../../shared/events';
import { PacienteEntity } from '../pacientes/infrastructure/PacienteEntity';
import { PacienteRepository } from '../pacientes/infrastructure/PacienteRepository';
import { IngresoInternacionService } from './application/IngresoInternacionService';
import { IngresoInternacionController } from './adapters/IngresoInternacionController';
import { createIngresoInternacionRoutes } from './adapters/ingresoInternacionRoutes';

const pacienteRepository = new PacienteRepository(
  AppDataSource.getRepository(PacienteEntity),
);
const service = new IngresoInternacionService(pacienteRepository, eventBus);
const controller = new IngresoInternacionController(service);

export const ingresoInternacionModule = {
  service,
  controller,
  routes: createIngresoInternacionRoutes(controller),
};
