import type { Indicacion } from './Indicaciones';

export interface IIndicacionesRepository {
  create(datos: Omit<Indicacion, 'id'>): Promise<Indicacion>;

  findById(id: number): Promise<Indicacion | null>;

  findByInternacionId(
    internacionId: number
  ): Promise<Indicacion[]>;

  findAll(): Promise<Indicacion[]>;

  update(
    id: number,
    datos: Partial<Omit<Indicacion, 'id'>>
  ): Promise<Indicacion | null>;
}