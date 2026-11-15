import { Repository } from 'typeorm';
import type { AntecedenteFamiliar } from '../domain/AntecedenteFamiliar';
import type { IAntecedenteFamiliarRepository } from '../domain/IAntecedenteFamiliarRepository';
import { AntecedenteFamiliarEntity } from './AntecedenteFamiliarEntity';

export class AntecedenteFamiliarRepository
  implements IAntecedenteFamiliarRepository
{
  constructor(private readonly repo: Repository<AntecedenteFamiliarEntity>) {}

  private toDomain = (
    entity: AntecedenteFamiliarEntity
  ): AntecedenteFamiliar => ({
    id: entity.id,
    pacienteId: entity.pacienteId,
    parentesco: entity.parentesco,
    enfermedad: entity.enfermedad,
    observaciones: entity.observaciones,
    fechaRegistro: entity.fechaRegistro,
  });

  async findByPacienteId(pacienteId: number): Promise<AntecedenteFamiliar[]> {
    const entities = await this.repo.find({
      where: { pacienteId },
      order: { fechaRegistro: 'DESC' },
    });

    return entities.map(this.toDomain);
  }

  async findById(id: number): Promise<AntecedenteFamiliar | null> {
    const entity = await this.repo.findOneBy({ id });
    return entity ? this.toDomain(entity) : null;
  }

  async create(
    data: Omit<AntecedenteFamiliar, 'id' | 'fechaRegistro'>
  ): Promise<AntecedenteFamiliar> {
    const entity = this.repo.create(data);
    const saved = await this.repo.save(entity);

    return this.toDomain(saved);
  }

  async update(
    id: number,
    data: Partial<
      Pick<AntecedenteFamiliar, 'parentesco' | 'enfermedad' | 'observaciones'>
    >
  ): Promise<AntecedenteFamiliar | null> {
    const entity = await this.repo.findOneBy({ id });

    if (!entity) return null;

    this.repo.merge(entity, data);
    const saved = await this.repo.save(entity);

    return this.toDomain(saved);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}