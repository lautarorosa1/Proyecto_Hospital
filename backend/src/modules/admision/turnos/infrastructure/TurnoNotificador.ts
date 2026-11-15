import type { IEventBus } from '../../../../shared/domain/events/IEventBus';
import { DomainEvents } from '../../../../shared/domain/events/DomainEvents';
import type { Turno } from '../domain/Turno';
import type { TurnoAjustado } from '../domain/Entreturno';
import type { ITurnoNotificador } from '../domain/ITurnoNotificador';
import type { EsperaTurno } from '../domain/ListaEspera';
import type { Paciente } from '../../pacientes/domain/Paciente';

/** Publica los avisos como eventos de dominio; consultorios y recepción se suscriben al bus. */
export class TurnoNotificador implements ITurnoNotificador {
  constructor(private readonly bus: IEventBus) {}

  pacienteEnSalaDeEspera(turno: Turno): void {
    this.bus.publish(DomainEvents.TURNO_PACIENTE_EN_SALA_ESPERA, {
      turnoId: turno.id,
      profesionalId: turno.profesionalId,
      pacienteId: turno.pacienteId,
      fecha: turno.fecha,
      horaInicio: turno.horaInicio,
    });
  }

  turnosReducidosPorEntreturno(
    entreturno: Turno,
    afectados: TurnoAjustado[],
  ): void {
    if (afectados.length === 0) return;
    this.bus.publish(DomainEvents.TURNOS_REDUCIDOS, {
      entreturnoId: entreturno.id,
      profesionalId: entreturno.profesionalId,
      fecha: entreturno.fecha,
      horaInicio: entreturno.horaInicio,
      afectados: afectados.map(({ antes, despues }) => ({
        turnoId: antes.id,
        pacienteId: antes.pacienteId,
        horaInicioAnterior: antes.horaInicio,
        horaInicioNueva: despues.horaInicio,
        duracionAnteriorMin: antes.duracionMin,
        duracionNuevaMin: despues.duracionMin,
      })),
    });
  }

  turnoCancelado(cancelado: Turno, liberado: Turno): void {
    this.bus.publish(DomainEvents.TURNO_CANCELADO, {
      turnoId: cancelado.id,
      profesionalId: cancelado.profesionalId,
      pacienteId: cancelado.pacienteId,
      fecha: cancelado.fecha,
      horaInicio: cancelado.horaInicio,
      turnoLiberadoId: liberado.id,
    });
  }

  listaEsperaPromovida(
    espera: EsperaTurno,
    turno: Turno,
    paciente: Paciente,
  ): void {
    const nombre = `${paciente.apellido}, ${paciente.nombre}`;
    this.bus.publish(DomainEvents.LISTA_ESPERA_PROMOVIDA, {
      esperaId: espera.id,
      turnoId: turno.id,
      pacienteId: paciente.id,
      pacienteNombre: nombre,
      profesionalId: turno.profesionalId,
      fecha: turno.fecha,
      horaInicio: turno.horaInicio,
      mensaje: `Avisar a ${nombre}: se le asignó el turno de las ${turno.horaInicio} del ${turno.fecha}`,
    });
  }
}
