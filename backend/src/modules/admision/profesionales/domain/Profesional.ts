export const TIPOS_PROFESIONAL = [
  'medico',
  'enfermero',
  'kinesiologo',
  'psicologo',
  'bioquimico',
  'odontologo',
  'otro',
] as const;

export const ESTADOS_PROFESIONAL = ['activo', 'inactivo', 'licencia'] as const;

export type TipoProfesional = (typeof TIPOS_PROFESIONAL)[number];
export type EstadoProfesional = (typeof ESTADOS_PROFESIONAL)[number];

export function esTipoProfesional(valor: string): valor is TipoProfesional {
  return (TIPOS_PROFESIONAL as readonly string[]).includes(valor);
}

export function esEstadoProfesional(valor: string): valor is EstadoProfesional {
  return (ESTADOS_PROFESIONAL as readonly string[]).includes(valor);
}

export interface Profesional {
  id: number;
  usuarioId: number;
  especialidadId: number;

  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono?: string;

  matricula: string;
  tipoProfesional: TipoProfesional;
  estado: EstadoProfesional;
}
