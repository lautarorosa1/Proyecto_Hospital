import { AppDataSource } from '../../../data-source';
import { AdministracionMedicacionEntity } from './AdministracionMedicacionEntity';
import { ConflictError } from '../../../shared/errors';

import type { IAdministracionesRepository } from '../domain/AdministracionesRepository';
import type { AdministracionMedicacion } from '../domain/AdministracionMedicacion';

export class AdministracionesRepositoryPostgres
  implements IAdministracionesRepository {

  private get repository() {
    return AppDataSource.getRepository(AdministracionMedicacionEntity);
  }

  async create(
    datos: Omit<AdministracionMedicacion, 'id'>
  ): Promise<AdministracionMedicacion> {
    try {
      const guardada = await this.repository.save(
        this.repository.create({
          medicacionId: datos.medicacionId,
          internacionId: datos.internacionId,
          enfermeroId: datos.enfermeroId,
          programadaPara: new Date(datos.programadaPara),
          administradaEn: new Date(datos.administradaEn),
          cantidadDescontada: datos.cantidadDescontada,
        })
      );
      return this.toDomain(guardada);
    } catch (error) {
      // Dos confirmaciones simultáneas de la misma dosis: gana la primera.
      const code = (error as { driverError?: { code?: string } })?.driverError?.code;
      if (code === '23505') {
        throw new ConflictError('Esa dosis ya fue registrada como administrada');
      }
      throw error;
    }
  }

  async findByInternacionId(
    internacionId: number
  ): Promise<AdministracionMedicacion[]> {
    const filas = await this.repository.find({
      where: { internacionId },
      order: { administradaEn: 'DESC' },
    });
    return filas.map((fila) => this.toDomain(fila));
  }

  async existe(medicacionId: number, programadaPara: string): Promise<boolean> {
    return this.repository.exists({
      where: { medicacionId, programadaPara: new Date(programadaPara) },
    });
  }

  private toDomain(e: AdministracionMedicacionEntity): AdministracionMedicacion {
    return {
      id: e.id,
      medicacionId: e.medicacionId,
      internacionId: e.internacionId,
      enfermeroId: e.enfermeroId,
      programadaPara: e.programadaPara.toISOString(),
      administradaEn: e.administradaEn.toISOString(),
      cantidadDescontada: e.cantidadDescontada,
    };
  }
}
