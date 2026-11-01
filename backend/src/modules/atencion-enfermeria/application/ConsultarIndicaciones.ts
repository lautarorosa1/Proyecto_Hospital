import type { Indicacion } from '../domain/Indicaciones';
import type { IIndicacionesRepository } from '../domain/IndicacionesRepository';

export class ConsultarIndicaciones {
  constructor(
    private readonly repositorio: IIndicacionesRepository
  ) {}

  async ejecutar(): Promise<Indicacion[]> {
    return await this.repositorio.findAll();
  }

  async buscarPorInternacion(
    internacionId: number
  ): Promise<Indicacion[]> {

    if (!Number.isInteger(internacionId) || internacionId <= 0) {
      throw new Error('El ID de la internación debe ser positivo.');
    }

    return await this.repositorio.findByInternacionId(internacionId);
  }
}