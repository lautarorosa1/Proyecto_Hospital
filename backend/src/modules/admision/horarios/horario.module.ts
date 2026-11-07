import { AppDataSource } from '../../../data-source';
import { HorarioProfesionalEntity } from './infrastructure/HorarioProfesionalEntity';
import { HorarioRepository } from './infrastructure/HorarioRepository';
import { HorarioService } from './application/HorarioService';
import { HorarioController } from './adapters/HorarioController';
import { createHorarioRoutes } from './adapters/horarioRoutes';

import { ProfesionalEntity } from '../profesionales/infrastructure/ProfesionalEntity';
import { ProfesionalRepository } from '../profesionales/infrastructure/ProfesionalRepository';

const horarioRepository = new HorarioRepository(
  AppDataSource.getRepository(HorarioProfesionalEntity),
);
const profesionalRepository = new ProfesionalRepository(
  AppDataSource.getRepository(ProfesionalEntity),
);

const horarioService = new HorarioService(horarioRepository, profesionalRepository);
const horarioController = new HorarioController(horarioService);

export const horarioModule = {
  controller: horarioController,
  routes: createHorarioRoutes(horarioController),
};
