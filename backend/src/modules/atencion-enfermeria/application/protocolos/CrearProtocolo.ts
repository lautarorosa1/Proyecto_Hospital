import type { Protocolo } from '../../domain/Protocolos';
import { ProtocoloBuilder } from '../../domain/ProtocoloBuilder';
import type { IProtocoloRepository } from '../../domain/ProtocolosRepository';

export class CrearProtocolo {

  constructor(
    private readonly protocoloRepository: IProtocoloRepository
  ) {}

  async execute(
    datos: Omit<Protocolo, 'id'>
  ): Promise<Protocolo> {

    const builder = new ProtocoloBuilder();

    const protocolo = builder
      .setNombre(datos.nombre)
      .setDescripcion(datos.descripcion);

    datos.pasos.forEach((paso) => {
      protocolo.agregarPaso(paso);
    });

    const nuevoProtocolo = protocolo.build();

    return await this.protocoloRepository.create(nuevoProtocolo);
  }
}