import type { Indicacion } from '../domain/Indicaciones';
import type { IIndicacionesRepository } from '../domain/IndicacionesRepository';

export class RegistrarIndicacion {
  constructor(
    private readonly repositorio: IIndicacionesRepository
  ) {}

  async ejecutar(
    datos: Omit<Indicacion, 'id'>
  ): Promise<Indicacion> {

    if (!Number.isInteger(datos.internacionId) || datos.internacionId <= 0) {
      throw new Error('El ID de la internación debe ser positivo.');
    }

    if (!Number.isInteger(datos.profesionalId) || datos.profesionalId <= 0) {
      throw new Error('El ID del profesional debe ser positivo.');
    }

    if (!datos.descripcion.trim()) {
      throw new Error('La descripción de la indicación es obligatoria.');
    }

    if (!datos.fecha || Number.isNaN(Date.parse(datos.fecha))) {
      throw new Error('La fecha no es válida.');
    }

    return await this.repositorio.create(datos);
  }
}