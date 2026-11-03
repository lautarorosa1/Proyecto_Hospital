import type { Internacion } from '../domain/Internaciones';
import type { IInternacionRepository } from '../domain/InternacionRepository';

export class FinalizarInternacion {
  constructor(
    private readonly repositorio: IInternacionRepository
  ) {}

  async ejecutar(id: number): Promise<Internacion> {
    const internacion = await this.repositorio.findById(id);

    if (!internacion) {
      throw new Error('No se encontró la internación.');
    }

    if (internacion.estado === 'FINALIZADA') {
      throw new Error('La internación ya está finalizada.');
    }

    const fechaEgreso = new Date().toISOString().split('T')[0];

    const internacionActualizada = await this.repositorio.update(id, {
      estado: 'FINALIZADA',
      fechaEgreso,
    });

    if (!internacionActualizada) {
      throw new Error('No se pudo finalizar la internación.');
    }

    return internacionActualizada;
  }
}