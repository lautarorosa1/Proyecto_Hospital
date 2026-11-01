import type { Medicacion } from '../domain/Medicaciones';
import type { IMedicacionesRepository } from '../domain/MedicacionesRepository';

export class RegistrarMedicacion {
  constructor(
    private readonly repositorio: IMedicacionesRepository
  ) {}

  async ejecutar(
    datos: Omit<Medicacion, 'id'>
  ): Promise<Medicacion> {

    if (!Number.isInteger(datos.internacionId) || datos.internacionId <= 0) {
      throw new Error('El ID de la internación debe ser positivo.');
    }

    if (!Number.isInteger(datos.profesionalId) || datos.profesionalId <= 0) {
      throw new Error('El ID del profesional debe ser positivo.');
    }

    if (!datos.nombre.trim()) {
      throw new Error('El nombre del medicamento es obligatorio.');
    }

    if (!datos.dosis.trim()) {
      throw new Error('La dosis es obligatoria.');
    }

    if (!datos.frecuencia.trim()) {
      throw new Error('La frecuencia es obligatoria.');
    }

    if (!datos.viaAdministracion.trim()) {
      throw new Error('La vía de administración es obligatoria.');
    }

    if (!datos.fechaInicio || Number.isNaN(Date.parse(datos.fechaInicio))) {
      throw new Error('La fecha de inicio no es válida.');
    }

    return await this.repositorio.create(datos);
  }
}