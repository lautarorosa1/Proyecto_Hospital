import type { EventEmitter } from 'node:events';
import type { Turno } from '../domain/Turno';
import type { TurnoAjustado } from '../domain/Entreturno';
import type { ITurnoNotificador } from '../domain/ITurnoNotificador';

export const EVENTO_PACIENTE_EN_SALA_ESPERA = 'turno.paciente_en_sala_espera';

export interface PacienteEnSalaEsperaEvento {
  turnoId: number;
  profesionalId: number;
  pacienteId?: number;
  fecha: string;
  horaInicio: string;
}

export const EVENTO_TURNOS_REDUCIDOS = 'turno.duracion_reducida';

export interface TurnosReducidosEvento {
  entreturnoId: number;
  profesionalId: number;
  fecha: string;
  horaInicio: string;
  afectados: {
    turnoId: number;
    pacienteId?: number;
    horaInicioAnterior: string;
    horaInicioNueva: string;
    duracionAnteriorMin: number;
    duracionNuevaMin: number;
  }[];
}

/** Publica los avisos como eventos internos; el consultorio se suscribe al bus. */
export class TurnoNotificador implements ITurnoNotificador {
  constructor(private readonly bus: EventEmitter) {}

  pacienteEnSalaDeEspera(turno: Turno): void {
    const evento: PacienteEnSalaEsperaEvento = {
      turnoId: turno.id,
      profesionalId: turno.profesionalId,
      pacienteId: turno.pacienteId,
      fecha: turno.fecha,
      horaInicio: turno.horaInicio,
    };
    this.bus.emit(EVENTO_PACIENTE_EN_SALA_ESPERA, evento);
  }

  turnosReducidosPorEntreturno(
    entreturno: Turno,
    afectados: TurnoAjustado[],
  ): void {
    if (afectados.length === 0) return;
    const evento: TurnosReducidosEvento = {
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
    };
    this.bus.emit(EVENTO_TURNOS_REDUCIDOS, evento);
  }
}
