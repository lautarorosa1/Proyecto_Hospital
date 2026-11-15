import type { Internacion } from '../domain/Internaciones';
import type { IInternacionRepository } from '../domain/InternacionRepository';
import { NotFoundError } from '../../../shared/errors';

export class ConsultarInternaciones {
  constructor(
    private readonly repositorio: IInternacionRepository
  ) {}

  async ejecutar(): Promise<Internacion[]> {
    return this.repositorio.findAll();
  }

  async porId(id: number): Promise<Internacion> {
    const internacion = await this.repositorio.findById(id);
    if (!internacion) throw new NotFoundError('No se encontró la internación.');
    return internacion;
  }
}