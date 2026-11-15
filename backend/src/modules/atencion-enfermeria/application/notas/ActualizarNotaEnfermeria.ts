import type { NotaEnfermeria } from '../../domain/NotaEnfermeria';
import type { INotaEnfermeriaRepository } from '../../domain/NotaEnfermeriaRepository';

export class ActualizarNotaEnfermeria {
  constructor(
    private readonly repository: INotaEnfermeriaRepository
  ) {}

  async ejecutar(
    id: number,
    datos: Partial<Omit<NotaEnfermeria, 'id'>>
  ): Promise<NotaEnfermeria | null> {
    return await this.repository.update(id, datos);
  }
}