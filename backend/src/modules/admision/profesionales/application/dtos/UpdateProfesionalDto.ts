import type { EstadoProfesional, TipoProfesional } from '../../domain/Profesional';

export interface UpdateProfesionalDto {
  /** string = vincular a ese usuario; null = desvincular. */
  usuarioId?: string | null;
  nombre?: string;
  apellido?: string;
  dni?: string;
  email?: string;
  telefono?: string;
  matricula?: string;
  tipoProfesional?: TipoProfesional;
  duracionTurnoMin?: number;
  estado?: EstadoProfesional;
}
