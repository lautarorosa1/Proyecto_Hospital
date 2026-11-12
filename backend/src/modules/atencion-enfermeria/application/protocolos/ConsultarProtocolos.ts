import type { Protocolo } from '../../domain/Protocolos';
import type { IProtocoloRepository } from '../../domain/ProtocolosRepository';

export class ConsultarProtocolos {

  constructor(
    private readonly protocoloRepository: IProtocoloRepository
  ) {}

  async consultarTodos(): Promise<Protocolo[]> {
    return await this.protocoloRepository.findAll();
  }

  async consultarPorId(id: number): Promise<Protocolo | null> {
    return await this.protocoloRepository.findById(id);
  }

  async consultarPorInternacion(internacionId: number): Promise<Protocolo[]> {
    return await this.protocoloRepository.findByInternacionId(internacionId);
  }
}