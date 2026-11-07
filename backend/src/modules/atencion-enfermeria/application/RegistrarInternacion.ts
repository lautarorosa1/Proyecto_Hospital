import type { Internacion } from '../domain/Internaciones';
import type { IInternacionRepository } from '../domain/InternacionRepository';

export class RegistrarInternacion {
  constructor(
    private readonly repositorio: IInternacionRepository
  ) {}

  async ejecutar(
    datos: Omit<Internacion, 'id'>
  ): Promise<Internacion> {
    if (!Number.isInteger(datos.pacienteId) || datos.pacienteId <= 0) {
      throw new Error('El ID del paciente debe ser positivo.');
    }

    if (!datos.motivoIngreso.trim()) {
      throw new Error('El motivo de ingreso es obligatorio.');
    }

    if (!datos.fechaIngreso || Number.isNaN(Date.parse(datos.fechaIngreso))) {
      throw new Error('La fecha de ingreso no es válida.');
    }

    return this.repositorio.create(datos);
  }
}