import type { NivelTriaje } from './NivelTriaje';

export const ESTADOS_INGRESO = [
  'en_espera',
  'en_atencion',
  'atendido',
  'cancelado',
] as const;

export type EstadoIngreso = (typeof ESTADOS_INGRESO)[number];

export interface IngresoGuardia {
  id: number;
  pacienteId: number;
  /** Profesional (tipo enfermero) que hizo la evaluación de triaje. */
  enfermeroId: number;
  nivelTriaje: NivelTriaje;
  /** Derivada del nivel (1 = más urgente). Es la clave de orden de la cola. */
  prioridad: number;
  motivoConsulta: string;
  observaciones?: string;
  estado: EstadoIngreso;
  ingresadoEn: Date;
}

export type NuevoIngresoGuardia = Pick<
  IngresoGuardia,
  | 'pacienteId'
  | 'enfermeroId'
  | 'nivelTriaje'
  | 'prioridad'
  | 'motivoConsulta'
  | 'observaciones'
>;
