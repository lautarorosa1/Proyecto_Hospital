import type { IngresoGuardia } from './IngresoGuardia';
import type { Paciente } from '../../pacientes/domain/Paciente';

/**
 * Puerto de notificaciones de la guardia. Admisión no sabe cómo llega la alerta
 * a los monitores: la implementación decide el canal (evento interno, SSE...).
 */
export interface IGuardiaNotificador {
  /** Ingresó un paciente con Riesgo Vital: alertar a los médicos indicados. */
  alertaRiesgoVital(
    ingreso: IngresoGuardia,
    paciente: Paciente,
    medicosIds: number[],
  ): void | Promise<void>;
}
