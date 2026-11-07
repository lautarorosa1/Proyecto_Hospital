import type { Protocolo } from './Protocolos';

export interface IProtocoloRepository {

  create(datos: Omit<Protocolo, 'id'>): Promise<Protocolo>;

  findById(id: number): Promise<Protocolo | null>;

  findAll(): Promise<Protocolo[]>;

  update(
    id: number,
    datos: Partial<Omit<Protocolo, 'id'>>
  ): Promise<Protocolo | null>;

  delete(id: number): Promise<boolean>;
}