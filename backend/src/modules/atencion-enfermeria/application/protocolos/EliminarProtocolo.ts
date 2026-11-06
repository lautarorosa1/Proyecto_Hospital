import type { IProtocoloRepository } from '../../domain/ProtocolosRepository';

export class EliminarProtocolo {

  constructor(
    private readonly protocoloRepository: IProtocoloRepository
  ) {}

  async execute(id: number): Promise<boolean> {
    return await this.protocoloRepository.delete(id);
  }
}