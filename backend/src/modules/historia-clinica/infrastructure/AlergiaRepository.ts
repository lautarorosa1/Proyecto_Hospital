import { Repository } from 'typeorm';
import type { Alergia } from '../domain/Alergia';
import type { IAlergiaRepository } from '../domain/IAlergiaRepository';
import { AlergiaEntity } from './AlergiaEntity';

export class AlergiaRepository implements IAlergiaRepository {
  constructor(private readonly repo: Repository<AlergiaEntity>) {}

  private toDomain = (entity: AlergiaEntity): Alergia => ({
    id: entity.id,
    alergeno: entity.alergeno,
    reaccion: entity.reaccion,
    severidad: entity.severidad as Alergia['severidad'],
    fechaRegistro: entity.fechaRegistro,
    pacienteId: entity.pacienteId,
  });

  async findByPacienteId(pacienteId: number): Promise<Alergia[]> {
    const entities = await this.repo.find({
      where: { pacienteId },
      order: { fechaRegistro: 'DESC' },
    });

    return entities.map(this.toDomain);
  }

  async findById(id: number): Promise<Alergia | null> {
    const entity = await this.repo.findOneBy({ id });
    return entity ? this.toDomain(entity) : null;
  }

  async create(
    data: Omit<Alergia, 'id' | 'fechaRegistro'>
  ): Promise<Alergia> {
    const entity = this.repo.create(data);
    const saved = await this.repo.save(entity);

    return this.toDomain(saved);
  }

  async update(
    id: number,
    data: Partial<Pick<Alergia, 'alergeno' | 'reaccion' | 'severidad'>>
  ): Promise<Alergia | null> {
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