import type { Internacion } from '../../domain/Internaciones';
import type { Protocolo } from '../../domain/Protocolos';
import type { IProtocoloRepository } from '../../domain/ProtocolosRepository';
import { ProtocoloDirector } from '../../domain/ProtocoloBuilder';

/**
 * Genera automáticamente el protocolo de atención base al admitir a un
 * paciente, sin depender de una orden manual inicial. El Director elige el
 * Builder según el tipo de ingreso (Pre-Op, Respiratory o General).
 */
export class GenerarProtocoloDeIngreso {
  constructor(
    private readonly protocoloRepository: IProtocoloRepository,
    private readonly director: ProtocoloDirector = new ProtocoloDirector()
  ) {}

  async ejecutar(internacion: Internacion): Promise<Protocolo> {
    const datos = this.director.construir(
      internacion.tipoIngreso ?? 'GENERAL',
      internacion.id
    );

    return await this.protocoloRepository.create(datos);
  }
}
