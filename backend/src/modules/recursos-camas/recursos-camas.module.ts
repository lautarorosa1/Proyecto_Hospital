import { AppDataSource } from '../../data-source';
import { HabitacionEntity } from './infrastructure/HabitacionEntity';
import { HabitacionRepository } from './infrastructure/HabitacionRepository';
import { HabitacionService } from './application/HabitacionService';
import { HabitacionController } from './adapters/HabitacionController';
import { createHabitacionRoutes } from './adapters/habitacionRoutes';
import { InsumoEntity } from './infrastructure/InsumoEntity';
import { InsumoRepository } from './infrastructure/InsumoRepository';
import { InsumoService } from './application/InsumoService';
import { InsumoController } from './adapters/InsumoController';
import { createInsumoRoutes } from './adapters/insumoRoutes';
import { CamaRepository } from './infrastructure/CamaRepository';
import { CamaService } from './application/CamaService';
import { CamaController } from './adapters/CamaController';
import { createCamaRoutes } from './adapters/camaRoutes';

const habitacionRepository = new HabitacionRepository(
  AppDataSource.getRepository(HabitacionEntity),
);
const habitacionService = new HabitacionService(habitacionRepository);
const habitacionController = new HabitacionController(habitacionService);

const insumoRepository = new InsumoRepository(
  AppDataSource.getRepository(InsumoEntity),
);
const insumoService = new InsumoService(insumoRepository);
const insumoController = new InsumoController(insumoService);

const camaRepository = new CamaRepository(AppDataSource);
const camaService = new CamaService(camaRepository, habitacionRepository);
const camaController = new CamaController(camaService);

export const recursosCamasModule = {
  habitacionController,
  habitacionRoutes: createHabitacionRoutes(habitacionController),
  insumoController,
  insumoRoutes: createInsumoRoutes(insumoController),
  camaService,
  camaController,
  camaRoutes: createCamaRoutes(camaController),
};