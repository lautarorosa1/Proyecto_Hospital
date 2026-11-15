export const TIPOS_HABITACION = ['INTERNACION', 'CONSULTORIO'] as const;
export type TipoHabitacion = (typeof TIPOS_HABITACION)[number];

export function esTipoHabitacion(valor: unknown): valor is TipoHabitacion {
  return (
    typeof valor === 'string' && (TIPOS_HABITACION as readonly string[]).includes(valor)
  );
}

export interface Habitacion {
  id: number;
  numero: string;
  piso: string;
  sector: string;
  /**
   * INTERNACION: tiene camas y aparece en el mapa de camas (default).
   * CONSULTORIO: la ocupa un profesional mientras atiende turnos; no admite camas.
   */
  tipo?: TipoHabitacion;
}