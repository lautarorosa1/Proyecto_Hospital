
import type { SignosVitales } from '../domain/SignosVitales';
import type { ISignosVitalesRepository } from '../domain/SignosVitalesRepository';

export class RegistrarSignosVitales {
  constructor(
    private readonly repositorio: ISignosVitalesRepository
  ) {}

  async ejecutar(
    datos: Omit<SignosVitales, 'id'>
  ): Promise<SignosVitales> {

    // Validar ID de internación
    if (!Number.isInteger(datos.internacionId) || datos.internacionId <= 0) {
      throw new Error('El ID de la internación debe ser positivo.');
    }

    // Validar ID del profesional
    if (!Number.isInteger(datos.profesionalId) || datos.profesionalId <= 0) {
      throw new Error('El ID del profesional debe ser positivo.');
    }

    // Validar fecha y hora
    if (!datos.fechaHora || isNaN(Date.parse(datos.fechaHora))) {
      throw new Error('La fecha y hora deben ser válidas.');
    }

    // Validar temperatura
    if (!Number.isFinite(datos.temperatura) || datos.temperatura <= 0) {
      throw new Error('La temperatura debe ser positiva.');
    }

    // Validar frecuencia cardíaca
    if (!Number.isFinite(datos.frecuenciaCardiaca) || datos.frecuenciaCardiaca <= 0) {
      throw new Error('La frecuencia cardíaca debe ser positiva.');
    }

    // Validar frecuencia respiratoria
    if (!Number.isFinite(datos.frecuenciaRespiratoria) || datos.frecuenciaRespiratoria <= 0) {
      throw new Error('La frecuencia respiratoria debe ser positiva.');
    }

    // Validar presión arterial
    if (
      !Number.isFinite(datos.presionSistolica) ||
      !Number.isFinite(datos.presionDiastolica) ||
      datos.presionSistolica <= 0 ||
      datos.presionDiastolica <= 0
    ) {
      throw new Error('La presión arterial debe ser positiva.');
    }

    // Validar saturación de oxígeno
    if (
      !Number.isFinite(datos.saturacionOxigeno) ||
      datos.saturacionOxigeno < 0 ||
      datos.saturacionOxigeno > 100
    ) {
      throw new Error('La saturación de oxígeno debe estar entre 0 y 100.');
    }

    return await this.repositorio.create(datos);
  }
}