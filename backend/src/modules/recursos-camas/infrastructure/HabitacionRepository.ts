import { Repository } from 'typeorm';
import type { Habitacion } from '../domain/Habitacion';
import type { IHabitacionRepository } from '../domain/IHabitacionRepository';
import { HabitacionEntity } from './HabitacionEntity';

export class HabitacionRepository implements IHabitacionRepository {
  constructor(private readonly repo: Repository<HabitacionEntity>) {}

  private toDomain = (entity: HabitacionEntity): Habitacion => ({
    id: entity.id,
    numero: entity.numero,
    piso: entity.piso,
    sector: entity.sector,
  });

  async findAll(): Promise<Habitacion[]> {
    const entities = await this.repo.find();
    return entities.map(this.toDomain);
  }

  async findById(id: number): Promise<Habitacion | null> {
    const entity = await this.repo.findOneBy({ id });
    return entity ? this.toDomain(entity) : null;
  }

  async create(data: Omit<Habitacion, 'id'>): Promise<Habitacion> {
    const entity = this.repo.create(data);
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async update(
    id: number,
    data: Partial<Omit<Habitacion, 'id'>>,
  ): Promise<Habitacion | null> {
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