import type { Protocolo } from '../../domain/Protocolos';
import { ProtocoloBuilder } from '../../domain/ProtocoloBuilder';
import type { IProtocoloRepository } from '../../domain/ProtocolosRepository';

export class ActualizarProtocolo {

  constructor(
    private readonly protocoloRepository: IProtocoloRepository
  ) {}

  async execute(
    id: number,
    datos: Partial<Omit<Protocolo, 'id'>>
  ): Promise<Protocolo | null> {

    const existente = await this.protocoloRepository.findById(id);

    if (!existente) {
      return null;
    }

    const builder = new ProtocoloBuilder();

    const protocolo = builder
      .setNombre(datos.nombre ?? existente.nombre)
      .setDescripcion(datos.descripcion ?? existente.descripcion);

    const pasos: string[] = datos.pasos ?? existente.pasos;

    pasos.forEach((paso: string) => {
      protocolo.agregarPaso(paso);
    });

    const protocoloActualizado = protocolo.build();

    return await this.protocoloRepository.update(
      id,
      protocoloActualizado
    );
  }
}