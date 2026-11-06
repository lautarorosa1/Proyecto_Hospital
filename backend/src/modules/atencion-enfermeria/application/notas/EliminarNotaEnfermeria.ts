
import type { INotaEnfermeriaRepository } from '../../domain/NotaEnfermeriaRepository';

export class EliminarNotaEnfermeria {
  constructor(
    private readonly repository: INotaEnfermeriaRepository
  ) {}

  async ejecutar(id: number): Promise<boolean> {
    return await this.repository.delete(id);
  }
}