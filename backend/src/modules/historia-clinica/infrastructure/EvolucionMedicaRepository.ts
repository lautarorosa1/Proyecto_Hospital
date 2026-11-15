import { Repository } from 'typeorm';
import type { EvolucionMedica } from '../domain/EvolucionMedica';
import type {
  IEvolucionMedicaRepository,
  CamposEditablesEvolucion
} from '../domain/IEvolucionMedicaRepository';
import { EvolucionMedicaEntity } from './EvolucionMedicaEntity';

export class EvolucionMedicaRepository implements IEvolucionMedicaRepository {
  constructor(private readonly repo: Repository<EvolucionMedicaEntity>) {}

  private toDomain = (entity: EvolucionMedicaEntity): EvolucionMedica => ({
    id: entity.id,
    pacienteId: entity.pacienteId,
    fecha: entity.fecha,
    motivoConsulta: entity.motivoConsulta,
    observaciones: entity.observaciones,
    indicaciones: entity.indicaciones,
    fechaRegistro: entity.fechaRegistro,
  });

  async findByPacienteId(pacienteId: number): Promise<EvolucionMedica[]> {
    const entities = await this.repo.find({
      where: { pacienteId },
      order: { fecha: 'DESC', id: 'DESC' },
    });

    return entities.map(this.toDomain);
  }

  async findById(id: number): Promise<EvolucionMedica | null> {
    const entity = await this.repo.findOneBy({ id });
    return entity ? this.toDomain(entity) : null;
  }

  async create(
    data: Omit<EvolucionMedica, 'id' | 'fechaRegistro'>
  ): Promise<EvolucionMedica> {
    const entity = this.repo.create(data);
    const saved = await this.repo.save(entity);

    return this.toDomain(saved);
  }

  async update(
    id: number,
    data: CamposEditablesEvolucion
  ): Promise<EvolucionMedica | null> {
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