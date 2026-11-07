import type { NotaEnfermeria } from '../../domain/NotaEnfermeria';
import type { INotaEnfermeriaRepository } from '../../domain/NotaEnfermeriaRepository';

export class CrearNotaEnfermeria {
  constructor(
    private readonly repository: INotaEnfermeriaRepository
  ) {}

  async ejecutar(
    datos: Omit<NotaEnfermeria, 'id'>
  ): Promise<NotaEnfermeria> {
    return await this.repository.create(datos);
  }
}