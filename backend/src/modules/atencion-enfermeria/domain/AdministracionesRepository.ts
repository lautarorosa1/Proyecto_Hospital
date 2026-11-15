import type { AdministracionMedicacion } from './AdministracionMedicacion';

export interface IAdministracionesRepository {
  create(
    datos: Omit<AdministracionMedicacion, 'id'>
  ): Promise<AdministracionMedicacion>;

  findByInternacionId(internacionId: number): Promise<AdministracionMedicacion[]>;

  existe(medicacionId: number, programadaPara: string): Promise<boolean>;
}
