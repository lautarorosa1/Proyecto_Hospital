// "disponible" es el estado inicial de un slot que todavía no fue reservado.
// El ciclo de vida del turno propiamente dicho (HU 2.1) arranca en "programado"
// y sus transiciones están en EstadoTurnoState.ts (patrón State).
export const ESTADOS_TURNO = [
  'disponible',
  'programado',
  'confirmado',
  'en_sala_espera',
  'atendido',
  'cancelado',
] as const;

export type EstadoTurno = (typeof ESTADOS_TURNO)[number];

export function esEstadoTurno(valor: string): valor is EstadoTurno {
  return (ESTADOS_TURNO as readonly string[]).includes(valor);
}

export interface Turno {
  id: number;
  profesionalId: number;
  pacienteId?: number; // vacío mientras el slot está disponible

  fecha: string; // "YYYY-MM-DD"
  horaInicio: string; // "HH:mm" (hora local de la clínica)
  duracionMin: number;

  estado: EstadoTurno;
  version: number; // control de concurrencia optimista

  // HU 1.2 - Entreturno
  /** true si el turno se insertó como entreturno (urgencia menor). */
  esEntreturno: boolean;
  /** Duración que tenía el turno antes de ser reducido por un entreturno. */
  duracionOriginalMin?: number;
  /** Entreturno que provocó el recorte de este turno. */
  reducidoPorEntreturnoId?: number;
}

/** Datos para insertar un turno nuevo (los campos del entreturno son opcionales). */
export type NuevoTurno = Pick<
  Turno,
  'profesionalId' | 'pacienteId' | 'fecha' | 'horaInicio' | 'duracionMin' | 'estado'
> & { esEntreturno?: boolean };
