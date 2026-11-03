import type { Indicacion } from '../domain/Indicaciones';
import type { IIndicacionesRepository } from '../domain/IndicacionesRepository';

export class IndicacionesRepositoryMemoria
  implements IIndicacionesRepository {

  private indicaciones: Indicacion[] = [];
  private siguienteId = 1;

  async create(
    datos: Omit<Indicacion, 'id'>
  ): Promise<Indicacion> {
    const nuevaIndicacion: Indicacion = {
      ...datos,
      id: this.siguienteId++,
    };

    this.indicaciones.push(nuevaIndicacion);

    return { ...nuevaIndicacion };
  }

  async findById(id: number): Promise<Indicacion | null> {
    const indicacion = this.indicaciones.find(
      (item) => item.id === id
    );

    return indicacion ? { ...indicacion } : null;
  }

  async findByInternacionId(
    internacionId: number
  ): Promise<Indicacion[]> {
    return this.indicaciones
      .filter((item) => item.internacionId === internacionId)
      .map((item) => ({ ...item }));
  }

  async findAll(): Promise<Indicacion[]> {
    return this.indicaciones.map((item) => ({ ...item }));
  }

  async update(
    id: number,
    datos: Partial<Omit<Indicacion, 'id'>>
  ): Promise<Indicacion | null> {
    const indice = this.indicaciones.findIndex(
      (item) => item.id === id
    );

    if (indice === -1) {
      return null;
    }

    this.indicaciones[indice] = {
      ...this.indicaciones[indice],
      ...datos,
    };

    return { ...this.indicaciones[indice] };
  }
}