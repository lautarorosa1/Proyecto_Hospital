import type { Medicacion } from '../domain/Medicaciones';
import type { IMedicacionesRepository } from '../domain/MedicacionesRepository';

export class ConsultarMedicaciones {
  constructor(
    private readonly repositorio: IMedicacionesRepository
  ) {}

  async ejecutar(): Promise<Medicacion[]> {
    return await this.repositorio.findAll();
  }

  async buscarPorInternacion(
    internacionId: number
  ): Promise<Medicacion[]> {

    if (!Number.isInteger(internacionId) || internacionId <= 0) {
      throw new Error('El ID de la internación debe ser positivo.');
    }

    return await this.repositorio.findByInternacionId(internacionId);
  }
}