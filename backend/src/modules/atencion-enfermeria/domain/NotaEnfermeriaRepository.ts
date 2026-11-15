import type { NotaEnfermeria } from './NotaEnfermeria';

export interface INotaEnfermeriaRepository {
  create(
    datos: Omit<NotaEnfermeria, 'id'>
  ): Promise<NotaEnfermeria>;

  findById(id: number): Promise<NotaEnfermeria | null>;

  findAll(): Promise<NotaEnfermeria[]>;

  update(
    id: number,
    datos: Partial<Omit<NotaEnfermeria, 'id'>>
  ): Promise<NotaEnfermeria | null>;

  delete(id: number): Promise<boolean>;
}