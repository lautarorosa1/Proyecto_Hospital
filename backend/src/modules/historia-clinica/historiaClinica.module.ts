import { AppDataSource } from '../../data-source';

import { PacienteEntity } from '../admision/pacientes/infrastructure/PacienteEntity';
import { PacienteRepository } from '../admision/pacientes/infrastructure/PacienteRepository';

import { AlergiaEntity } from './infrastructure/AlergiaEntity';
import { AlergiaRepository } from './infrastructure/AlergiaRepository';
import { AlergiaService } from './application/AlergiaService';
import { AlergiaController } from './adapters/AlergiaController';
import { createAlergiaRoutes } from './adapters/alergiaRoutes';

import { AntecedenteFamiliarEntity } from './infrastructure/AntecedenteFamiliarEntity';
import { AntecedenteFamiliarRepository } from './infrastructure/AntecedenteFamiliarRepository';
import { AntecedenteFamiliarService } from './application/AntecedenteFamiliarService';
import { AntecedenteFamiliarController } from './adapters/AntecedenteFamiliarController';
import { createAntecedenteFamiliarRoutes } from './adapters/antecedenteFamiliarRoutes';

import { EvolucionMedicaEntity } from './infrastructure/EvolucionMedicaEntity';
import { EvolucionMedicaRepository } from './infrastructure/EvolucionMedicaRepository';
import { EvolucionMedicaService } from './application/EvolucionMedicaService';
import { EvolucionMedicaController } from './adapters/EvolucionMedicaController';
import { createEvolucionMedicaRoutes } from './adapters/evolucionMedicaRoutes';

import { EstudioMedicoEntity } from './infrastructure/EstudioMedicoEntity';
import { EstudioMedicoRepository } from './infrastructure/EstudioMedicoRepository';
import { EstudioMedicoService } from './application/EstudioMedicoService';
import { EstudioMedicoController } from './adapters/EstudioMedicoController';
import { createEstudioMedicoRoutes } from './adapters/estudioMedicoRoutes';

// Repositorio de pacientes (para verificar su existencia)
const pacienteRepository = new PacienteRepository(
  AppDataSource.getRepository(PacienteEntity)
);

// Alergias
const alergiaRepository = new AlergiaRepository(
  AppDataSource.getRepository(AlergiaEntity)
);
const alergiaService = new AlergiaService(
  alergiaRepository,
  pacienteRepository
);
const alergiaController = new AlergiaController(alergiaService);

// Antecedentes familiares
const antecedenteFamiliarRepository = new AntecedenteFamiliarRepository(
  AppDataSource.getRepository(AntecedenteFamiliarEntity)
);
const antecedenteFamiliarService = new AntecedenteFamiliarService(
  antecedenteFamiliarRepository,
  pacienteRepository
);
const antecedenteFamiliarController = new AntecedenteFamiliarController(
  antecedenteFamiliarService
);

// Evoluciones médicas
const evolucionMedicaRepository = new EvolucionMedicaRepository(
  AppDataSource.getRepository(EvolucionMedicaEntity)
);
const evolucionMedicaService = new EvolucionMedicaService(
  evolucionMedicaRepository,
  pacienteRepository
);
const evolucionMedicaController = new EvolucionMedicaController(
  evolucionMedicaService
);

// Estudios médicos
const estudioMedicoRepository = new EstudioMedicoRepository(
  AppDataSource.getRepository(EstudioMedicoEntity)
);
const estudioMedicoService = new EstudioMedicoService(
  estudioMedicoRepository,
  pacienteRepository
);
const estudioMedicoController = new EstudioMedicoController(
  estudioMedicoService
);

// Módulo de Historia Clínica
export const historiaClinicaModule = {
  controller: alergiaController,
  routes: createAlergiaRoutes(alergiaController),
  antecedenteFamiliarRoutes: createAntecedenteFamiliarRoutes(
    antecedenteFamiliarController
  ),
  evolucionMedicaRoutes: createEvolucionMedicaRoutes(
    evolucionMedicaController
  ),
  estudioMedicoRoutes: createEstudioMedicoRoutes(estudioMedicoController),
};