import type { Internacion } from './Internaciones';

export interface IInternacionRepository {
  create(datos: Omit<Internacion, 'id'>): Promise<Internacion>;

  findById(id: number): Promise<Internacion | null>;

  findByPacienteId(pacienteId: number): Promise<Internacion[]>;

  findAll(): Promise<Internacion[]>;

  update(
    id: number,
    datos: Partial<Omit<Internacion, 'id'>>
  ): Promise<Internacion | null>;
}

