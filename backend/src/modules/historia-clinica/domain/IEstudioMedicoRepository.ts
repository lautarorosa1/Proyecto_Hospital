import type { EstudioMedico } from './EstudioMedico';

export type CamposEditablesEstudio = Partial<
  Pick<EstudioMedico, 'fecha' | 'tipoEstudio' | 'descripcion' | 'resultado'>
>;

export interface IEstudioMedicoRepository {
  findByPacienteId(pacienteId: number): Promise<EstudioMedico[]>;
  findById(id: number): Promise<EstudioMedico | null>;
  create(
    data: Omit<EstudioMedico, 'id' | 'fechaRegistro'>
  ): Promise<EstudioMedico>;
  update(
    id: number,
    data: CamposEditablesEstudio
  ): Promise<EstudioMedico | null>;
  delete(id: number): Promise<boolean>;
}