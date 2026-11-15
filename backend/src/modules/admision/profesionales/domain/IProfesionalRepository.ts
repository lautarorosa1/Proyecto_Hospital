import type {
  EstadoProfesional,
  Profesional,
  TipoProfesional,
} from './Profesional';

export interface FiltrosProfesional {
  estado?: EstadoProfesional;
  tipoProfesional?: TipoProfesional;
}

export interface IProfesionalRepository {
  findAll(filtros?: FiltrosProfesional): Promise<Profesional[]>;
  findById(id: number): Promise<Profesional | null>;
  findByDni(dni: string): Promise<Profesional | null>;
  findByEmail(email: string): Promise<Profesional | null>;
  findByMatricula(matricula: string): Promise<Profesional | null>;
  findByUsuarioId(usuarioId: string): Promise<Profesional | null>;
  create(data: Omit<Profesional, 'id'>): Promise<Profesional>;
  update(
    id: number,
    data: Partial<Omit<Profesional, 'id'>>,
  ): Promise<Profesional | null>;
}
