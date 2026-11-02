import type { Turno } from './Turno';
import type { TurnoAjustado } from './Entreturno';

/**
 * Puerto de notificaciones del turno. Admisión no conoce a quién le llega el
 * aviso: la implementación decide el canal (evento interno, cola, websocket...).
 */
export interface ITurnoNotificador {
  /** El paciente se anunció en recepción: avisar al consultorio del profesional. */
  pacienteEnSalaDeEspera(turno: Turno): void | Promise<void>;

  /** Un entreturno recortó turnos: avisar al profesional que tiene menos tiempo. */
  turnosReducidosPorEntreturno(
    entreturno: Turno,
    afectados: TurnoAjustado[],
  ): void | Promise<void>;
}
