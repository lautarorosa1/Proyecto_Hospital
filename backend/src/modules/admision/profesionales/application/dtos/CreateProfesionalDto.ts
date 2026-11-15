import type { EstadoProfesional, TipoProfesional } from '../../domain/Profesional';

export interface CreateProfesionalDto {
  /** Opcional: si se omite, se vincula solo cuando existe un usuario con el mismo email. */
  usuarioId?: string;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono?: string;
  matricula: string;
  tipoProfesional: TipoProfesional;
  duracionTurnoMin?: number; // minutos por turno; por defecto 30
  estado?: EstadoProfesional; // por defecto "activo"
}
