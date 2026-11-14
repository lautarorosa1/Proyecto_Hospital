import { AppDataSource } from '../../data-source';
import { eventBus } from '../../shared/events';
import type { IEventBus } from '../../shared/domain/events/IEventBus';
import { DomainEvents } from '../../shared/domain/events/DomainEvents';
import { SseChannel } from '../../shared/infrastructure/sse/SseChannel';
import { BadRequestError } from '../../shared/errors';

// Dependencias de otros módulos (siempre a través de sus repositorios / servicios)
import { turnoModule } from '../admision/turnos/turno.module';
import { PacienteEntity } from '../admision/pacientes/infrastructure/PacienteEntity';
import { PacienteRepository } from '../admision/pacientes/infrastructure/PacienteRepository';
import { ProfesionalEntity } from '../admision/profesionales/infrastructure/ProfesionalEntity';
import { ProfesionalRepository } from '../admision/profesionales/infrastructure/ProfesionalRepository';
import { HabitacionEntity } from '../recursos-camas/infrastructure/HabitacionEntity';
import { HabitacionRepository } from '../recursos-camas/infrastructure/HabitacionRepository';

import { OcupacionConsultorioEntity } from './infrastructure/OcupacionConsultorioEntity';
import { OcupacionRepository } from './infrastructure/OcupacionRepository';
import { NotificacionConsultorioEntity } from './infrastructure/NotificacionConsultorioEntity';
import { NotificacionRepository } from './infrastructure/NotificacionRepository';
import { OcupacionService } from './application/OcupacionService';
import { AgendaConsultorioService } from './application/AgendaConsultorioService';
import { NotificacionService } from './application/NotificacionService';
import { ConsultorioController } from './adapters/ConsultorioController';
import { createConsultorioRoutes } from './adapters/consultorioRoutes';

const pacienteRepository = new PacienteRepository(AppDataSource.getRepository(PacienteEntity));
const profesionalRepository = new ProfesionalRepository(
  AppDataSource.getRepository(ProfesionalEntity),
);
const habitacionRepository = new HabitacionRepository(
  AppDataSource.getRepository(HabitacionEntity),
);
const ocupacionRepository = new OcupacionRepository(
  AppDataSource.getRepository(OcupacionConsultorioEntity),
);
const notificacionRepository = new NotificacionRepository(
  AppDataSource.getRepository(NotificacionConsultorioEntity),
);

// Tiempo real (SSE): cada profesional escucha su propio canal; las salas tienen uno general.
const canalProfesional = new SseChannel<{ profesionalId: number }>((req) => {
  const profesionalId = Number(req.params.profesionalId);
  if (!Number.isInteger(profesionalId) || profesionalId <= 0) {
    throw new BadRequestError('profesionalId debe ser un entero positivo');
  }
  return { profesionalId };
});
const canalEstado = new SseChannel();

const notificacionService = new NotificacionService(notificacionRepository, (n) =>
  canalProfesional.difundir('notificacion', n, (f) => f.profesionalId === n.profesionalId),
);
const ocupacionService = new OcupacionService(
  ocupacionRepository,
  habitacionRepository,
  profesionalRepository,
  eventBus,
);
const agendaService = new AgendaConsultorioService(
  turnoModule.turnoService,
  pacienteRepository,
  profesionalRepository,
  ocupacionRepository,
);
const controller = new ConsultorioController(ocupacionService, agendaService, notificacionService);

const nombrePaciente = async (pacienteId?: number): Promise<string> => {
  if (!pacienteId) return 'Paciente';
  const p = await pacienteRepository.findById(pacienteId);
  return p ? `${p.apellido}, ${p.nombre}` : `Paciente #${pacienteId}`;
};

/**
 * El consultorio recibe los avisos de Admisión y los deja en la bandeja del profesional:
 *  - TURNO_PACIENTE_EN_SALA_ESPERA: un paciente llegó a recepción.
 *  - TURNOS_REDUCIDOS: un entreturno le recortó tiempo de atención.
 *  - TURNO_CANCELADO / LISTA_ESPERA_PROMOVIDA: cambios en su agenda.
 *  - ALERTA_RIESGO_VITAL: Código Rojo en guardia (a los médicos destinatarios).
 * Además refleja en tiempo real quién ocupa cada consultorio.
 */
export function suscribirConsultorio(bus: IEventBus): void {
  bus.subscribe(DomainEvents.TURNO_PACIENTE_EN_SALA_ESPERA, async (e) => {
    const paciente = await nombrePaciente(e.pacienteId);
    await notificacionService.notificar({
      profesionalId: e.profesionalId,
      tipo: 'SALA_ESPERA',
      titulo: 'Paciente en sala de espera',
      mensaje: `${paciente} llegó para el turno de las ${e.horaInicio}.`,
      referenciaId: e.turnoId,
    });
  });

  bus.subscribe(DomainEvents.TURNOS_REDUCIDOS, async (e) => {
    const cantidad = e.afectados.length;
    await notificacionService.notificar({
      profesionalId: e.profesionalId,
      tipo: 'ENTRETURNO',
      titulo: 'Entreturno insertado',
      mensaje:
        `Se agregó un entreturno a las ${e.horaInicio}: ${cantidad} turno${cantidad === 1 ? '' : 's'} ` +
        `con menos tiempo de atención.`,
      referenciaId: e.entreturnoId,
    });
  });

  bus.subscribe(DomainEvents.TURNO_CANCELADO, async (e) => {
    const paciente = await nombrePaciente(e.pacienteId);
    await notificacionService.notificar({
      profesionalId: e.profesionalId,
      tipo: 'TURNO_CANCELADO',
      titulo: 'Turno cancelado',
      mensaje: `${paciente} canceló el turno de las ${e.horaInicio} del ${e.fecha}.`,
      referenciaId: e.turnoId,
    });
  });

  bus.subscribe(DomainEvents.LISTA_ESPERA_PROMOVIDA, async (e) => {
    await notificacionService.notificar({
      profesionalId: e.profesionalId,
      tipo: 'LISTA_ESPERA',
      titulo: 'Turno asignado desde la lista de espera',
      mensaje: `${e.pacienteNombre} ocupó el horario de las ${e.horaInicio} del ${e.fecha}.`,
      referenciaId: e.turnoId,
    });
  });

  bus.subscribe(DomainEvents.ALERTA_RIESGO_VITAL, async (e) => {
    for (const profesionalId of e.medicosDestinatarios) {
      await notificacionService.notificar({
        profesionalId,
        tipo: 'RIESGO_VITAL',
        titulo: 'CÓDIGO ROJO en guardia',
        mensaje: `${e.pacienteNombre}: ${e.motivoConsulta}`,
        referenciaId: e.ingresoId,
      });
    }
  });

  bus.subscribe(DomainEvents.CONSULTORIO_OCUPADO, (e) => {
    canalEstado.difundir('consultorio_estado', { ...e, estado: 'ocupado' });
    canalProfesional.difundir('ocupacion', { ...e, estado: 'ocupado' }, (f) => f.profesionalId === e.profesionalId);
  });

  bus.subscribe(DomainEvents.CONSULTORIO_LIBERADO, (e) => {
    canalEstado.difundir('consultorio_estado', { ...e, estado: 'libre' });
    canalProfesional.difundir('ocupacion', { ...e, estado: 'libre' }, (f) => f.profesionalId === e.profesionalId);
  });
}

export const consultorioModule = {
  controller,
  ocupacionService,
  agendaService,
  notificacionService,
  routes: createConsultorioRoutes(controller, {
    profesional: canalProfesional.suscribir,
    estado: canalEstado.suscribir,
  }),
};
