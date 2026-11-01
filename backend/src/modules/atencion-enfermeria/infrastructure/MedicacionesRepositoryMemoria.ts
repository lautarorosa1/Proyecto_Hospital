import type { Medicacion } from '../domain/Medicaciones';
import type { IMedicacionesRepository } from '../domain/MedicacionesRepository';

export class MedicacionesRepositoryMemoria
  implements IMedicacionesRepository {

  private medicaciones: Medicacion[] = [];
  private siguienteId = 1;

  async create(
    datos: Omit<Medicacion, 'id'>
  ): Promise<Medicacion> {
    const nuevaMedicacion: Medicacion = {
      ...datos,
      id: this.siguienteId++,
    };

    this.medicaciones.push(nuevaMedicacion);

    return { ...nuevaMedicacion };
  }

  async findById(id: number): Promise<Medicacion | null> {
    const medicacion = this.medicaciones.find(
      (item) => item.id === id
    );

    return medicacion ? { ...medicacion } : null;
  }

  async findByInternacionId(
    internacionId: number
  ): Promise<Medicacion[]> {
    return this.medicaciones
      .filter((item) => item.internacionId === internacionId)
      .map((item) => ({ ...item }));
  }

  async findAll(): Promise<Medicacion[]> {
    return this.medicaciones.map((item) => ({ ...item }));
  }

  async update(
    id: number,
    datos: Partial<Omit<Medicacion, 'id'>>
  ): Promise<Medicacion | null> {
    const indice = this.medicaciones.findIndex(
      (item) => item.id === id
    );

    if (indice === -1) {
      return null;
    }

    this.medicaciones[indice] = {
      ...this.medicaciones[indice],
      ...datos,
    };

    return { ...this.medicaciones[indice] };
  }
}