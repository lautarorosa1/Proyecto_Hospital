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
import { InventarioRepository } from './infrastructure/InventarioRepository';
import { AdaptadorEventosRecursosCamas } from './adapters/AdaptadorEventosRecursosCamas';
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
const inventarioRepository = new InventarioRepository(AppDataSource);
const insumoService = new InsumoService(insumoRepository, inventarioRepository);
const insumoController = new InsumoController(insumoService);

const eventos = new AdaptadorEventosRecursosCamas();
eventos.definirConsumidor(async (payload) => {
  await insumoService.descontarPorMedicacion(payload);
});

const camaRepository = new CamaRepository(AppDataSource);
const camaService = new CamaService(camaRepository, habitacionRepository, eventos);
const camaController = new CamaController(camaService);

export const recursosCamasModule = {
  habitacionController,
  habitacionRoutes: createHabitacionRoutes(habitacionController),
  insumoController,
  insumoRoutes: createInsumoRoutes(insumoController),
  camaService,
  camaController,
  camaRoutes: createCamaRoutes(camaController),
  eventos,
};