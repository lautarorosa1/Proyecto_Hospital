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
import { CamasStream } from './adapters/CamasStream';
import { eventBus } from '../../shared/events';
import type { IEventBus } from '../../shared/domain/events/IEventBus';
import { DomainEvents } from '../../shared/domain/events/DomainEvents';
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

const eventos = new AdaptadorEventosRecursosCamas(eventBus);
const camasStream = new CamasStream(eventBus);

const camaRepository = new CamaRepository(AppDataSource);
const camaService = new CamaService(camaRepository, habitacionRepository, eventos);
const camaController = new CamaController(camaService);

/**
 * Reacciona a los eventos de otros módulos:
 *  - MEDICACION_ADMINISTRADA (Enfermería): descuenta el insumo del stock del piso
 *    con un decremento atómico (stock 50 -> 49).
 *  - PACIENTE_DADO_DE_ALTA (Enfermería): la cama pasa a "En limpieza" y queda
 *    bloqueada hasta que maestranza confirme la higiene.
 */
export function suscribirRecursosCamas(bus: IEventBus): void {
  bus.subscribe(DomainEvents.MEDICACION_ADMINISTRADA, async (e) => {
    await insumoService.descontarPorMedicacion({
      insumo_id: e.insumoId,
      cantidad: e.cantidad,
      referencia_id: e.administracionId,
    });
  });

  bus.subscribe(DomainEvents.PACIENTE_DADO_DE_ALTA, async (e) => {
    if (e.camaId === undefined) {
      console.warn(
        `[Camas] Alta del paciente ${e.pacienteId} sin cama asociada: no hay nada que liberar`,
      );
      return;
    }
    await camaService.liberarPorAlta(e.camaId, e.usuarioId);
  });
}

export const recursosCamasModule = {
  habitacionController,
  habitacionRoutes: createHabitacionRoutes(habitacionController),
  insumoController,
  insumoRoutes: createInsumoRoutes(insumoController),
  camaService,
  camaController,
  camaRoutes: createCamaRoutes(camaController, camasStream),
  camasStream,
  eventos,
};