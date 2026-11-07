import type { Internacion } from '../domain/Internaciones';
import type { IInternacionRepository } from '../domain/InternacionRepository';

export class ConsultarInternaciones {
  constructor(
    private readonly repositorio: IInternacionRepository
  ) {}

  async ejecutar(): Promise<Internacion[]> {
    return this.repositorio.findAll();
  }
}