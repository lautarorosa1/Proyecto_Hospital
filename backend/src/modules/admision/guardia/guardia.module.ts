import { AppDataSource } from '../../../data-source';
import { eventBus } from '../../../shared/events';
import type { IEventBus } from '../../../shared/domain/events/IEventBus';
import { DomainEvents } from '../../../shared/domain/events/DomainEvents';
import { IngresoGuardiaEntity } from './infrastructure/IngresoGuardiaEntity';
import { IngresoGuardiaRepository } from './infrastructure/IngresoGuardiaRepository';
import { GuardiaNotificador } from './infrastructure/GuardiaNotificador';
import { GuardiaService } from './application/GuardiaService';
import { GuardiaController } from './adapters/GuardiaController';
import { AlertasGuardiaStream } from './adapters/AlertasGuardiaStream';
import { createGuardiaRoutes } from './adapters/guardiaRoutes';

// Dependencias de otros submódulos de admisión
import { PacienteEntity } from '../pacientes/infrastructure/PacienteEntity';
import { PacienteRepository } from '../pacientes/infrastructure/PacienteRepository';
import { ProfesionalEntity } from '../profesionales/infrastructure/ProfesionalEntity';
import { ProfesionalRepository } from '../profesionales/infrastructure/ProfesionalRepository';

const ingresoRepository = new IngresoGuardiaRepository(
  AppDataSource.getRepository(IngresoGuardiaEntity),
);
const pacienteRepository = new PacienteRepository(
  AppDataSource.getRepository(PacienteEntity),
);
const profesionalRepository = new ProfesionalRepository(
  AppDataSource.getRepository(ProfesionalEntity),
);

const guardiaNotificador = new GuardiaNotificador(eventBus);

// Los monitores de los médicos reciben la alerta por SSE (GET /guardia/alertas/stream).
const alertasStream = new AlertasGuardiaStream(eventBus);

/** Registro en consola de las alertas, igual que el resto de avisos de admisión. */
export function suscribirGuardia(bus: IEventBus): void {
  bus.subscribe(DomainEvents.ALERTA_RIESGO_VITAL, (e) => {
    console.log(
      `[Guardia] ALERTA RIESGO VITAL: ${e.pacienteNombre} (ingreso ${e.ingresoId}) - "${e.motivoConsulta}" -> médicos ${e.medicosDestinatarios.join(', ') || 'ninguno'}`,
    );
  });
  bus.subscribe(DomainEvents.SIGNOS_VITALES_ALERTA, (e) => {
    console.log(
      `[Guardia] ALERTA SIGNOS VITALES: paciente ${e.pacienteId} (internación ${e.internacionId}${e.sector ? `, sector ${e.sector}` : ''}) temperatura ${e.temperatura} °C`,
    );
  });
}

const guardiaService = new GuardiaService(
  ingresoRepository,
  pacienteRepository,
  profesionalRepository,
  guardiaNotificador,
);
const guardiaController = new GuardiaController(guardiaService);

export const guardiaModule = {
  controller: guardiaController,
  routes: createGuardiaRoutes(guardiaController, alertasStream),
};
