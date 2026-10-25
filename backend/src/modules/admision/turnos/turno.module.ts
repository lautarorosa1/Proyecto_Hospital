import { AppDataSource } from '../../../data-source';
import { TurnoEntity } from './infrastructure/TurnoEntity';
import { TurnoRepository } from './infrastructure/TurnoRepository';
import {
  EVENTO_PACIENTE_EN_SALA_ESPERA,
  EVENTO_TURNOS_REDUCIDOS,
  PacienteEnSalaEsperaEvento,
  TurnosReducidosEvento,
  TurnoNotificador,
} from './infrastructure/TurnoNotificador';
import { eventBus } from '../../../shared/eventBus';
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

// Hasta que exista el módulo de consultorio, el aviso solo se registra en consola.
// Cuando exista, se suscribe a este mismo evento desde su propio módulo.
eventBus.on(
  EVENTO_PACIENTE_EN_SALA_ESPERA,
  (e: PacienteEnSalaEsperaEvento) => {
    console.log(
      `[Consultorio] Paciente ${e.pacienteId} en sala de espera (turno ${e.turnoId}, profesional ${e.profesionalId}, ${e.fecha} ${e.horaInicio})`,
    );
  },
);

eventBus.on(EVENTO_TURNOS_REDUCIDOS, (e: TurnosReducidosEvento) => {
  for (const a of e.afectados) {
    console.log(
      `[Consultorio] Entreturno ${e.entreturnoId} (profesional ${e.profesionalId}, ${e.fecha} ${e.horaInicio}): turno ${a.turnoId} de ${a.duracionAnteriorMin} a ${a.duracionNuevaMin} min (inicio ${a.horaInicioAnterior} -> ${a.horaInicioNueva})`,
    );
  }
});

const turnoService = new TurnoService(
  turnoRepository,
  profesionalRepository,
  pacienteRepository,
  horarioRepository,
  turnoNotificador,
);
const turnoController = new TurnoController(turnoService);

export const turnoModule = {
  controller: turnoController,
  routes: createTurnoRoutes(turnoController),
};
