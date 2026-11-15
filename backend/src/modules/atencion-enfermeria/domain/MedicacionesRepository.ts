import type { Medicacion } from './Medicaciones';

export interface IMedicacionesRepository {
  create(
    datos: Omit<Medicacion, 'id'>
  ): Promise<Medicacion>;

  findById(id: number): Promise<Medicacion | null>;

  findByInternacionId(
    internacionId: number
  ): Promise<Medicacion[]>;

  findAll(): Promise<Medicacion[]>;

  update(
    id: number,
    datos: Partial<Omit<Medicacion, 'id'>>
  ): Promise<Medicacion | null>;
}