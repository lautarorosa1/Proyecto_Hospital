import type { AntecedenteFamiliar } from './AntecedenteFamiliar';

export interface IAntecedenteFamiliarRepository {
  findByPacienteId(pacienteId: number): Promise<AntecedenteFamiliar[]>;
  findById(id: number): Promise<AntecedenteFamiliar | null>;
  create(
    data: Omit<AntecedenteFamiliar, 'id' | 'fechaRegistro'>
  ): Promise<AntecedenteFamiliar>;
  update(
    id: number,
    data: Partial<
      Pick<AntecedenteFamiliar, 'parentesco' | 'enfermedad' | 'observaciones'>
    >
  ): Promise<AntecedenteFamiliar | null>;
  delete(id: number): Promise<boolean>;
}