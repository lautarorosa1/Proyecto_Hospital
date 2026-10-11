import type { EstadoProfesional, TipoProfesional } from '../../domain/Profesional';

export interface CreateProfesionalDto {
  usuarioId: number;
  especialidadId: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono?: string;
  matricula: string;
  tipoProfesional: TipoProfesional;
  estado?: EstadoProfesional; // por defecto "activo"
}
