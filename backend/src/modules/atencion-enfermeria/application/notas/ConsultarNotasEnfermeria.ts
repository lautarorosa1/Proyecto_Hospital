
import type { NotaEnfermeria } from '../../domain/NotaEnfermeria';
import type { INotaEnfermeriaRepository } from '../../domain/NotaEnfermeriaRepository';

export class ConsultarNotasEnfermeria {
  constructor(
    private readonly repository: INotaEnfermeriaRepository
  ) {}

  async consultarTodas(): Promise<NotaEnfermeria[]> {
    return await this.repository.findAll();
  }

  async consultarPorId(id: number): Promise<NotaEnfermeria | null> {
    return await this.repository.findById(id);
  }
}