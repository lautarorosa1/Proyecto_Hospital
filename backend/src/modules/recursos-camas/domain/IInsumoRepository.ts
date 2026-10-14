import type { Insumo } from './Insumo';

export interface IInsumoRepository {
  findAll(): Promise<Insumo[]>;
  findById(id: number): Promise<Insumo | null>;
  create(data: Omit<Insumo, 'id'>): Promise<Insumo>;
  update(id: number, data: Partial<Omit<Insumo, 'id'>>): Promise<Insumo | null>;
  delete(id: number): Promise<boolean>;
}