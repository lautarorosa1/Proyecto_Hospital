import type { Alergia } from './Alergia';

export interface IAlergiaRepository {
  findByPacienteId(pacienteId: number): Promise<Alergia[]>;

  findById(id: number): Promise<Alergia | null>;

  create(data: Omit<Alergia, 'id' | 'fechaRegistro'>): Promise<Alergia>;

  update(
    id: number,
    data: Partial<Pick<Alergia, 'alergeno' | 'reaccion' | 'severidad'>>
  ): Promise<Alergia | null>;

  delete(id: number): Promise<boolean>;
}