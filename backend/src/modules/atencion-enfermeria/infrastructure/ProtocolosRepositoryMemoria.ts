import type { Protocolo } from '../domain/Protocolos';
import type { IProtocoloRepository } from '../domain/ProtocolosRepository';

export class ProtocolosRepositoryMemoria
  implements IProtocoloRepository {

  private protocolos: Protocolo[] = [];
  private siguienteId = 1;

  async create(
    datos: Omit<Protocolo, 'id'>
  ): Promise<Protocolo> {

    const nuevoProtocolo: Protocolo = {
      ...datos,
      pasos: [...datos.pasos],
      id: this.siguienteId++,
    };

    this.protocolos.push(nuevoProtocolo);

    return {
      ...nuevoProtocolo,
      pasos: [...nuevoProtocolo.pasos],
    };
  }

  async findById(id: number): Promise<Protocolo | null> {

    const protocolo = this.protocolos.find(
      (item) => item.id === id
    );

    return protocolo
      ? { ...protocolo, pasos: [...protocolo.pasos] }
      : null;
  }

  async findAll(): Promise<Protocolo[]> {

    return this.protocolos.map((item) => ({
      ...item,
      pasos: [...item.pasos],
    }));
  }

  async update(
    id: number,
    datos: Partial<Omit<Protocolo, 'id'>>
  ): Promise<Protocolo | null> {

    const indice = this.protocolos.findIndex(
      (item) => item.id === id
    );

    if (indice === -1) {
      return null;
    }

    this.protocolos[indice] = {
      ...this.protocolos[indice],
      ...datos,
      pasos: datos.pasos
        ? [...datos.pasos]
        : [...this.protocolos[indice].pasos],
    };

    return {
      ...this.protocolos[indice],
      pasos: [...this.protocolos[indice].pasos],
    };
  }

  async delete(id: number): Promise<boolean> {

    const indice = this.protocolos.findIndex(
      (item) => item.id === id
    );

    if (indice === -1) {
      return false;
    }

    this.protocolos.splice(indice, 1);

    return true;
  }
}