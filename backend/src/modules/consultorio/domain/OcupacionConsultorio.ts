/**
 * Ocupación de un consultorio: mientras un profesional atiende turnos ocupa una
 * habitación de tipo CONSULTORIO. Se abre al empezar la atención y se cierra al terminar.
 * Reglas: una habitación tiene a lo sumo un profesional activo y un profesional
 * ocupa a lo sumo una habitación a la vez.
 */
export const ESTADOS_OCUPACION = ['activa', 'finalizada'] as const;
export type EstadoOcupacion = (typeof ESTADOS_OCUPACION)[number];

export interface OcupacionConsultorio {
  id: number;
  habitacionId: number;
  profesionalId: number;
  estado: EstadoOcupacion;
  iniciadaEn: Date;
  finalizadaEn?: Date;
}
