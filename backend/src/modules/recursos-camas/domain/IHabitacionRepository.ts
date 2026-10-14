import type { Habitacion } from './Habitacion';

export interface IHabitacionRepository {
  findAll(): Promise<Habitacion[]>;
  findById(id: number): Promise<Habitacion | null>;
  create(data: Omit<Habitacion, 'id'>): Promise<Habitacion>;
  update(id: number, data: Partial<Omit<Habitacion, 'id'>>): Promise<Habitacion | null>;
  delete(id: number): Promise<boolean>;
}