import { AppDataSource } from '../../../data-source';
import { TurnoEntity } from './infrastructure/TurnoEntity';
import { TurnoRepository } from './infrastructure/TurnoRepository';
import { TurnoNotificador } from './infrastructure/TurnoNotificador';
import { EsperaTurnoEntity } from './infrastructure/EsperaTurnoEntity';
import { ListaEsperaRepository } from './infrastructure/ListaEsperaRepository';
import { eventBus } from '../../../shared/events';
import type { IEventBus } from '../../../shared/domain/events/IEventBus';
import { DomainEvents } from '../../../shared/domain/events/DomainEvents';
import { SseChannel } from '../../../shared/infrastructure/sse/SseChannel';
import { TurnoService } from './application/TurnoService';
import { TurnoController } from './adapters/TurnoController';
import { createTurnoRoutes } from './adapters/turnoRoutes';

// Dependencias de otros submódulos de admisión
import { PacienteEntity } from '../pacientes/infrastructure/PacienteEntity';
import { PacienteRepository } from '../pacientes/infrastructure/PacienteRepository';
import { ProfesionalEntity } from '../profesionales/infrastructure/ProfesionalEntity';
import { ProfesionalRepository } from '../profesionales/infrastructure/ProfesionalRepository';
import { HorarioProfesionalEntity } from '../horarios/infrastructure/HorarioProfesionalEntity';
import { HorarioRepository } from '../horarios/infrastructure/HorarioRepository';

const turnoRepository = new TurnoRepository(
  AppDataSource.getRepository(TurnoEntity),
);
const pacienteRepository = new PacienteRepository(
  AppDataSource.getRepository(PacienteEntity),
);
const profesionalRepository = new ProfesionalRepository(
  AppDataSource.getRepository(ProfesionalEntity),
);

const horarioRepository = new HorarioRepository(
  AppDataSource.getRepository(HorarioProfesionalEntity),
);

const turnoNotificador = new TurnoNotificador(eventBus);
const listaEsperaRepository = new ListaEsperaRepository(
  AppDataSource.getRepository(EsperaTurnoEntity),
);

// Canal en tiempo real hacia recepción: avisa cuando un paciente de la lista de
// espera recibe un horario liberado (el recepcionista debe llamarlo/notificarlo).
const recepcionStream = new SseChannel();

const turnoService = new TurnoService(
  turnoRepository,
  profesionalRepository,
  pacienteRepository,
  horarioRepository,
  turnoNotificador,
  listaEsperaRepository,
);
const turnoController = new TurnoController(turnoService);

/** Suscriptores de los eventos que publica el propio módulo (consultorio y recepción). */
export function suscribirTurnos(bus: IEventBus): void {
  // Hasta que exista el módulo de consultorio, el aviso solo se registra en consola.
  bus.subscribe(DomainEvents.TURNO_PACIENTE_EN_SALA_ESPERA, (e) => {
    console.log(
      `[Consultorio] Paciente ${e.pacienteId} en sala de espera (turno ${e.turnoId}, profesional ${e.profesionalId}, ${e.fecha} ${e.horaInicio})`,
    );
  });

  bus.subscribe(DomainEvents.TURNOS_REDUCIDOS, (e) => {
    for (const a of e.afectados) {
      console.log(
        `[Consultorio] Entreturno ${e.entreturnoId} (profesional ${e.profesionalId}, ${e.fecha} ${e.horaInicio}): turno ${a.turnoId} de ${a.duracionAnteriorMin} a ${a.duracionNuevaMin} min (inicio ${a.horaInicioAnterior} -> ${a.horaInicioNueva})`,
      );
    }
  });

  bus.subscribe(DomainEvents.LISTA_ESPERA_PROMOVIDA, (e) => {
    console.log(`[Recepción] ${e.mensaje}`);
    recepcionStream.difundir('lista_espera_promovida', e);
  });
}

export const turnoModule = {
  controller: turnoController,
  routes: createTurnoRoutes(turnoController, recepcionStream),
  recepcionStream,
};
