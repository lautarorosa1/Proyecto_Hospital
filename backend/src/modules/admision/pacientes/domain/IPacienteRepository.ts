import type { Paciente } from './Paciente';

export interface IPacienteRepository {
  /** Solo pacientes activos (los dados de baja no se listan). */
  findAll(): Promise<Paciente[]>;
  findById(id: number): Promise<Paciente | null>;
  findByDni(dni: string): Promise<Paciente | null>;
  findByEmail(email: string): Promise<Paciente | null>;
  create(data: Omit<Paciente, 'id'>): Promise<Paciente>;
  update(id: number, data: Partial<Omit<Paciente, 'id'>>): Promise<Paciente | null>;
}