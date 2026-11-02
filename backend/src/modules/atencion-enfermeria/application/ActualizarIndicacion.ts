import type { Indicacion } from '../domain/Indicaciones';
import type { IIndicacionesRepository } from '../domain/IndicacionesRepository';

export class ActualizarIndicacion {
  constructor(
    private readonly repositorio: IIndicacionesRepository
  ) {}

  async ejecutar(
    id: number,
    datos: Partial<Omit<Indicacion, 'id'>>
  ): Promise<Indicacion> {

    const indicacion = await this.repositorio.findById(id);

    if (!indicacion) {
      throw new Error('No se encontró la indicación.');
    }

    if (datos.descripcion !== undefined && !datos.descripcion.trim()) {
      throw new Error('La descripción no puede estar vacía.');
    }

    const indicacionActualizada = await this.repositorio.update(
      id,
      datos
    );

    if (!indicacionActualizada) {
      throw new Error('No se pudo actualizar la indicación.');
    }

    return indicacionActualizada;
  }
}