import { Repository } from 'typeorm';
import type { Insumo } from '../domain/Insumo';
import type { IInsumoRepository } from '../domain/IInsumoRepository';
import { InsumoEntity } from './InsumoEntity';

export class InsumoRepository implements IInsumoRepository {
  constructor(private readonly repo: Repository<InsumoEntity>) {}

  private toDomain = (entity: InsumoEntity): Insumo => ({
    id: entity.id,
    nombre: entity.nombre,
    stock_actual: entity.stock_actual,
    unidad_medida: entity.unidad_medida,
  });

  async findAll(): Promise<Insumo[]> {
    const entities = await this.repo.find();
    return entities.map(this.toDomain);
  }

  async findById(id: number): Promise<Insumo | null> {
    const entity = await this.repo.findOneBy({ id });
    return entity ? this.toDomain(entity) : null;
  }

  async create(data: Omit<Insumo, 'id'>): Promise<Insumo> {
    const entity = this.repo.create(data);
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async update(
    id: number,
    data: Partial<Omit<Insumo, 'id'>>,
  ): Promise<Insumo | null> {
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