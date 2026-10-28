
import { AppDataSource } from '../../data-source';

import { PacienteEntity } from '../admision/pacientes/infrastructure/PacienteEntity';
import { PacienteRepository } from '../admision/pacientes/infrastructure/PacienteRepository';

import { AlergiaEntity } from './infrastructure/AlergiaEntity';
import { AlergiaRepository } from './infrastructure/AlergiaRepository';
import { AlergiaService } from './application/AlergiaService';
import { AlergiaController } from './adapters/AlergiaController';
import { createAlergiaRoutes } from './adapters/alergiaRoutes';

// Repositorio de alergias
const alergiaRepository = new AlergiaRepository(
  AppDataSource.getRepository(AlergiaEntity)
);

// Repositorio de pacientes (para verificar su existencia)
const pacienteRepository = new PacienteRepository(
  AppDataSource.getRepository(PacienteEntity)
);

// Servicio de alergias
const alergiaService = new AlergiaService(
  alergiaRepository,
  pacienteRepository
);

// Controlador de alergias
const alergiaController = new AlergiaController(alergiaService);

// Módulo de Historia Clínica
export const historiaClinicaModule = {
  controller: alergiaController,
  routes: createAlergiaRoutes(alergiaController),
};