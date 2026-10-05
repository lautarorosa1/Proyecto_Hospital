// src/modules/pacientes/paciente.module.ts
import { AppDataSource } from '../../data-source';
import { PacienteEntity } from './infrastructure/PacienteEntity';
import { PacienteRepository } from './infrastructure/PacienteRepository';
import { PacienteService } from './application/PacienteService';
import { PacienteController } from './adapters/PacienteController';
import { createPacienteRoutes } from './adapters/pacienteRoutes';

const pacienteRepository = new PacienteRepository(
  AppDataSource.getRepository(PacienteEntity),
);

const pacienteService = new PacienteService(pacienteRepository);
const pacienteController = new PacienteController(pacienteService);

export const pacienteModule = {
  controller: pacienteController,
  routes: createPacienteRoutes(pacienteController),
};