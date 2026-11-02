import { AppDataSource } from '../../../data-source';
import { eventBus } from '../../../shared/eventBus';
import { IngresoGuardiaEntity } from './infrastructure/IngresoGuardiaEntity';
import { IngresoGuardiaRepository } from './infrastructure/IngresoGuardiaRepository';
import {
  AlertaRiesgoVitalEvento,
  EVENTO_ALERTA_RIESGO_VITAL,
  GuardiaNotificador,
} from './infrastructure/GuardiaNotificador';
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

// Registro en consola, igual que el resto de avisos de admisión.
eventBus.on(EVENTO_ALERTA_RIESGO_VITAL, (e: AlertaRiesgoVitalEvento) => {
  console.log(
    `[Guardia] ALERTA RIESGO VITAL: ${e.pacienteNombre} (ingreso ${e.ingresoId}) - "${e.motivoConsulta}" -> médicos ${e.medicosDestinatarios.join(', ') || 'ninguno'}`,
  );
});

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
