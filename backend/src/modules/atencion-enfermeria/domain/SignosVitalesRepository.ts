import type { SignosVitales } from './SignosVitales';

export interface ISignosVitalesRepository {
  create(
    datos: Omit<SignosVitales, 'id'>
  ): Promise<SignosVitales>;

  findById(
    id: number
  ): Promise<SignosVitales | null>;

  findByInternacionId(
    internacionId: number
  ): Promise<SignosVitales[]>;

  update(
    id: number,
    datos: Partial<Omit<SignosVitales, 'id'>>
  ): Promise<SignosVitales | null>;

  // Eliminar signos vitales
  delete(
    id: number
  ): Promise<boolean>;
}