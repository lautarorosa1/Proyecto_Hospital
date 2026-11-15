import type { AdministracionMedicacion } from '../domain/AdministracionMedicacion';
import type { IAdministracionesRepository } from '../domain/AdministracionesRepository';
import { BadRequestError } from '../../../shared/errors';

export class ConsultarAdministraciones {
  constructor(private readonly repositorio: IAdministracionesRepository) {}

  async buscarPorInternacion(internacionId: number): Promise<AdministracionMedicacion[]> {
    if (!Number.isInteger(internacionId) || internacionId <= 0) {
      throw new BadRequestError('El ID de la internación debe ser positivo.');
    }
    return await this.repositorio.findByInternacionId(internacionId);
  }
}
