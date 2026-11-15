import type { EvolucionMedica } from './EvolucionMedica';

export type CamposEditablesEvolucion = Partial<
  Pick<
    EvolucionMedica,
    'fecha' | 'motivoConsulta' | 'observaciones' | 'indicaciones'
  >
>;

export interface IEvolucionMedicaRepository {
  findByPacienteId(pacienteId: number): Promise<EvolucionMedica[]>;
  findById(id: number): Promise<EvolucionMedica | null>;
  create(
    data: Omit<EvolucionMedica, 'id' | 'fechaRegistro'>
  ): Promise<EvolucionMedica>;
  update(
    id: number,
    data: CamposEditablesEvolucion
  ): Promise<EvolucionMedica | null>;
  delete(id: number): Promise<boolean>;
}