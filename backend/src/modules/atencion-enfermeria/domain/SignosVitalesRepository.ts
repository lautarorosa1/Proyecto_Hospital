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
}