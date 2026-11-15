import type { SignosVitales } from '../domain/SignosVitales';
import type { ISignosVitalesRepository } from '../domain/SignosVitalesRepository';

export class SignosVitalesRepositoryMemoria
  implements ISignosVitalesRepository {

  private registros: SignosVitales[] = [];

  private siguienteId = 1;

  // Registrar signos vitales
  async create(
    datos: Omit<SignosVitales, 'id'>
  ): Promise<SignosVitales> {
    const nuevoRegistro: SignosVitales = {
      ...datos,
      id: this.siguienteId++,
    };

    this.registros.push(nuevoRegistro);

    return { ...nuevoRegistro };
  }

  // Buscar signos vitales por ID
  async findById(
    id: number
  ): Promise<SignosVitales | null> {
    const registro = this.registros.find(
      (signo) => signo.id === id
    );

    return registro ? { ...registro } : null;
  }

  // Buscar signos vitales por internación
  async findByInternacionId(
    internacionId: number
  ): Promise<SignosVitales[]> {
    return this.registros
      .filter((signo) => signo.internacionId === internacionId)
      .map((signo) => ({ ...signo }));
  }

  // Actualizar signos vitales
  async update(
    id: number,
    datos: Partial<Omit<SignosVitales, 'id'>>
  ): Promise<SignosVitales | null> {
    const indice = this.registros.findIndex(
      (signo) => signo.id === id
    );

    if (indice === -1) {
      return null;
    }

    this.registros[indice] = {
      ...this.registros[indice],
      ...datos,
      id,
    };

    return { ...this.registros[indice] };
  }

  // Eliminar signos vitales
  async delete(id: number): Promise<boolean> {
    const indice = this.registros.findIndex(
      (signo) => signo.id === id
    );

    if (indice === -1) {
      return false;
    }

    this.registros.splice(indice, 1);

    return true;
  }
}