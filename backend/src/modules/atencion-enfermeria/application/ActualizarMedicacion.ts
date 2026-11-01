import type { Medicacion } from '../domain/Medicaciones';
import type { IMedicacionesRepository } from '../domain/MedicacionesRepository';

export class ActualizarMedicacion {
  constructor(
    private readonly repositorio: IMedicacionesRepository
  ) {}

  async ejecutar(
    id: number,
    datos: Partial<Omit<Medicacion, 'id'>>
  ): Promise<Medicacion> {

    const medicacion = await this.repositorio.findById(id);

    if (!medicacion) {
      throw new Error('No se encontró la medicación.');
    }

    if (datos.nombre !== undefined && !datos.nombre.trim()) {
      throw new Error('El nombre del medicamento no puede estar vacío.');
    }

    if (datos.dosis !== undefined && !datos.dosis.trim()) {
      throw new Error('La dosis no puede estar vacía.');
    }

    const medicacionActualizada = await this.repositorio.update(
      id,
      datos
    );

    if (!medicacionActualizada) {
      throw new Error('No se pudo actualizar la medicación.');
    }

    return medicacionActualizada;
  }
}