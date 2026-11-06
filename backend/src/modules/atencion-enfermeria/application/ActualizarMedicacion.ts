
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

    // Validar ID
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('El ID de la medicación no es válido.');
    }

    // Comprobar que exista la medicación
    const medicacion = await this.repositorio.findById(id);

    if (!medicacion) {
      throw new Error('No se encontró la medicación.');
    }

    // Validar campos de texto
    if (datos.nombre !== undefined && !datos.nombre.trim()) {
      throw new Error('El nombre del medicamento no puede estar vacío.');
    }

    if (datos.dosis !== undefined && !datos.dosis.trim()) {
      throw new Error('La dosis no puede estar vacía.');
    }

    if (datos.frecuencia !== undefined && !datos.frecuencia.trim()) {
      throw new Error('La frecuencia no puede estar vacía.');
    }

    if (
      datos.viaAdministracion !== undefined &&
      !datos.viaAdministracion.trim()
    ) {
      throw new Error('La vía de administración no puede estar vacía.');
    }

    // Validar estado
    if (
      datos.estado !== undefined &&
      !['ACTIVA', 'SUSPENDIDA', 'FINALIZADA'].includes(datos.estado)
    ) {
      throw new Error('El estado de la medicación no es válido.');
    }

    // Actualizar medicación
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