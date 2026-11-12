import { AppDataSource } from '../../../data-source';
import { ProtocoloEntity } from './ProtocoloEntity';
import { IProtocoloRepository } from '../domain/ProtocolosRepository';
import { Protocolo } from '../domain/Protocolos';

export class ProtocolosRepositoryPostgres
  implements IProtocoloRepository {

  private get repository() {
    return AppDataSource.getRepository(ProtocoloEntity);
  }

  private toDomain(entity: ProtocoloEntity): Protocolo {
    return {
      id: entity.id,
      nombre: entity.nombre,
      descripcion: entity.descripcion,
      pasos: entity.pasos,
      internacionId: entity.internacionId ?? undefined,
    };
  }

  async create(
    datos: Omit<Protocolo, 'id'>
  ): Promise<Protocolo> {

    const protocolo = this.repository.create(datos);

    const guardado = await this.repository.save(protocolo);

    return this.toDomain(guardado);
  }

  async findById(id: number): Promise<Protocolo | null> {

    const protocolo = await this.repository.findOneBy({ id });

    return protocolo ? this.toDomain(protocolo) : null;
  }

  async findAll(): Promise<Protocolo[]> {

    const protocolos = await this.repository.find();

    return protocolos.map((item) => this.toDomain(item));
  }

  async findByInternacionId(internacionId: number): Promise<Protocolo[]> {

    const protocolos = await this.repository.find({
      where: { internacionId },
      order: { id: 'ASC' },
    });

    return protocolos.map((item) => this.toDomain(item));
  }

  async update(
    id: number,
    datos: Partial<Omit<Protocolo, 'id'>>
  ): Promise<Protocolo | null> {

    const protocolo = await this.repository.findOneBy({ id });

    if (!protocolo) {
      return null;
    }

    const actualizado = this.repository.merge(protocolo, datos);

    return this.toDomain(await this.repository.save(actualizado));
  }

  async delete(id: number): Promise<boolean> {

    const resultado = await this.repository.delete(id);

    return resultado.affected !== 0;
  }
}
