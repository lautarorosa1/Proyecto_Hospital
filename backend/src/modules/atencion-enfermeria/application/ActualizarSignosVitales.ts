
import type { SignosVitales } from '../domain/SignosVitales';
import type { ISignosVitalesRepository } from '../domain/SignosVitalesRepository';

export class ActualizarSignosVitales {
  constructor(
    private readonly repositorio: ISignosVitalesRepository
  ) {}

  async ejecutar(
    id: number,
    datos: Partial<Omit<SignosVitales, 'id'>>
  ): Promise<SignosVitales> {

    // Validar ID del registro
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('El ID debe ser un número positivo.');
    }

    // Verificar que el registro exista
    const registro = await this.repositorio.findById(id);

    if (!registro) {
      throw new Error('No se encontraron los signos vitales.');
    }

    // Validar ID de internación
    if (
      datos.internacionId !== undefined &&
      (!Number.isInteger(datos.internacionId) || datos.internacionId <= 0)
    ) {
      throw new Error('El ID de la internación debe ser positivo.');
    }

    // Validar ID del profesional
    if (
      datos.profesionalId !== undefined &&
      (!Number.isInteger(datos.profesionalId) || datos.profesionalId <= 0)
    ) {
      throw new Error('El ID del profesional debe ser positivo.');
    }

    // Validar fecha y hora
    if (
      datos.fechaHora !== undefined &&
      (!datos.fechaHora || isNaN(Date.parse(datos.fechaHora)))
    ) {
      throw new Error('La fecha y hora deben ser válidas.');
    }

    // Validar temperatura
    if (
      datos.temperatura !== undefined &&
      (!Number.isFinite(datos.temperatura) || datos.temperatura <= 0)
    ) {
      throw new Error('La temperatura debe ser positiva.');
    }

    // Validar frecuencia cardíaca
    if (
      datos.frecuenciaCardiaca !== undefined &&
      (!Number.isFinite(datos.frecuenciaCardiaca) || datos.frecuenciaCardiaca <= 0)
    ) {
      throw new Error('La frecuencia cardíaca debe ser positiva.');
    }

    // Validar frecuencia respiratoria
    if (
      datos.frecuenciaRespiratoria !== undefined &&
      (!Number.isFinite(datos.frecuenciaRespiratoria) || datos.frecuenciaRespiratoria <= 0)
    ) {
      throw new Error('La frecuencia respiratoria debe ser positiva.');
    }

    // Validar presión arterial
    if (
      (datos.presionSistolica !== undefined &&
        (!Number.isFinite(datos.presionSistolica) || datos.presionSistolica <= 0)) ||
      (datos.presionDiastolica !== undefined &&
        (!Number.isFinite(datos.presionDiastolica) || datos.presionDiastolica <= 0))
    ) {
      throw new Error('La presión arterial debe ser positiva.');
    }

    // Validar saturación de oxígeno
    if (
      datos.saturacionOxigeno !== undefined &&
      (!Number.isFinite(datos.saturacionOxigeno) ||
        datos.saturacionOxigeno < 0 ||
        datos.saturacionOxigeno > 100)
    ) {
      throw new Error('La saturación de oxígeno debe estar entre 0 y 100.');
    }

    // Actualizar registro
    const actualizado = await this.repositorio.update(id, datos);

    if (!actualizado) {
      throw new Error('No se pudieron actualizar los signos vitales.');
    }

    return actualizado;
  }
}