import type { ISignosVitalesRepository } from '../domain/SignosVitalesRepository';

export class EliminarSignosVitales {
  constructor(
    private readonly repositorio: ISignosVitalesRepository
  ) {}

  async ejecutar(id: number): Promise<boolean> {

    // Validar ID del registro
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('El ID debe ser un número positivo.');
    }

    // Verificar que el registro exista
    const registro = await this.repositorio.findById(id);

    if (!registro) {
      throw new Error('No se encontraron los signos vitales.');
    }

    // Eliminar registro
    const eliminado = await this.repositorio.delete(id);

    if (!eliminado) {
      throw new Error('No se pudieron eliminar los signos vitales.');
    }

    return true;
  }
}