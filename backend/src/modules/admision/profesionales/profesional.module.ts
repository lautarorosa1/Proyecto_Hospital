import { AppDataSource } from '../../../data-source';
import { ProfesionalEntity } from './infrastructure/ProfesionalEntity';
import { ProfesionalRepository } from './infrastructure/ProfesionalRepository';
import { ProfesionalService } from './application/ProfesionalService';
import { ProfesionalController } from './adapters/ProfesionalController';
import { createProfesionalRoutes } from './adapters/profesionalRoutes';

const profesionalRepository = new ProfesionalRepository(
  AppDataSource.getRepository(ProfesionalEntity),
);

const profesionalService = new ProfesionalService(profesionalRepository);
const profesionalController = new ProfesionalController(profesionalService);

export const profesionalModule = {
  controller: profesionalController,
  routes: createProfesionalRoutes(profesionalController),
};
