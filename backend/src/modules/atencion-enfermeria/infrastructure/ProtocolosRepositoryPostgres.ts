
import { AppDataSource } from '../../../data-source';
import { ProtocoloEntity } from './ProtocoloEntity';
import { IProtocoloRepository } from '../domain/ProtocolosRepository';
import { Protocolo } from '../domain/Protocolos';

export class ProtocolosRepositoryPostgres
  implements IProtocoloRepository {

  private get repository() {
    return AppDataSource.getRepository(ProtocoloEntity);
  }

  async create(
    datos: Omit<Protocolo, 'id'>
  ): Promise<Protocolo> {

    const protocolo = this.repository.create(datos);

    const guardado = await this.repository.save(protocolo);

    return guardado;
  }

  async findById(id: number): Promise<Protocolo | null> {

    const protocolo = await this.repository.findOneBy({ id });

    return protocolo;
  }

  async findAll(): Promise<Protocolo[]> {

    const protocolos = await this.repository.find();

    return protocolos;
  }

  async update(
    id: number,
    datos: Partial<Omit<Protocolo, 'id'>>
  ): Promise<Protocolo | null> {

    const protocolo = await this.findById(id);

    if (!protocolo) {
      return null;
    }

    const actualizado = this.repository.merge(protocolo, datos);

    return await this.repository.save(actualizado);
  }

  async delete(id: number): Promise<boolean> {

    const resultado = await this.repository.delete(id);

    return resultado.affected !== 0;
  }
}