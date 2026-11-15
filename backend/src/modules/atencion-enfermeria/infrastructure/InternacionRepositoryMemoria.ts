import type { Internacion } from '../domain/Internaciones';
import type { IInternacionRepository } from '../domain/InternacionRepository';

export class InternacionRepositoryMemoria
  implements IInternacionRepository {

  private internaciones: Internacion[] = [];
  private siguienteId = 1;

  async create(
    datos: Omit<Internacion, 'id'>
  ): Promise<Internacion> {
    const nuevaInternacion: Internacion = {
      ...datos,
      id: this.siguienteId++,
    };

    this.internaciones.push(nuevaInternacion);

    return { ...nuevaInternacion };
  }

  async findById(id: number): Promise<Internacion | null> {
    const internacion = this.internaciones.find(
      (item) => item.id === id
    );

    return internacion ? { ...internacion } : null;
  }

  async findByPacienteId(
    pacienteId: number
  ): Promise<Internacion[]> {
    return this.internaciones
      .filter((item) => item.pacienteId === pacienteId)
      .map((item) => ({ ...item }));
  }

  async findAll(): Promise<Internacion[]> {
    return this.internaciones.map((item) => ({ ...item }));
  }

  async update(
    id: number,
    datos: Partial<Omit<Internacion, 'id'>>
  ): Promise<Internacion | null> {
    const indice = this.internaciones.findIndex(
      (item) => item.id === id
    );

    if (indice === -1) {
      return null;
    }

    this.internaciones[indice] = {
      ...this.internaciones[indice],
      ...datos,
    };

    return { ...this.internaciones[indice] };
  }
}