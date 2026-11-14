import { Repository } from 'typeorm';
import type { EstudioMedico } from '../domain/EstudioMedico';
import type {
  IEstudioMedicoRepository,
  CamposEditablesEstudio
} from '../domain/IEstudioMedicoRepository';
import { EstudioMedicoEntity } from './EstudioMedicoEntity';

export class EstudioMedicoRepository implements IEstudioMedicoRepository {
  constructor(private readonly repo: Repository<EstudioMedicoEntity>) {}

  private toDomain = (entity: EstudioMedicoEntity): EstudioMedico => ({
    id: entity.id,
    pacienteId: entity.pacienteId,
    fecha: entity.fecha,
    tipoEstudio: entity.tipoEstudio,
    descripcion: entity.descripcion,
    resultado: entity.resultado,
    fechaRegistro: entity.fechaRegistro,
  });

  async findByPacienteId(pacienteId: number): Promise<EstudioMedico[]> {
    const entities = await this.repo.find({
      where: { pacienteId },
      order: { fecha: 'DESC', id: 'DESC' },
    });

    return entities.map(this.toDomain);
  }

  async findById(id: number): Promise<EstudioMedico | null> {
    const entity = await this.repo.findOneBy({ id });
    return entity ? this.toDomain(entity) : null;
  }

  async create(
    data: Omit<EstudioMedico, 'id' | 'fechaRegistro'>
  ): Promise<EstudioMedico> {
    const entity = this.repo.create(data);
    const saved = await this.repo.save(entity);

    return this.toDomain(saved);
  }

  async update(
    id: number,
    data: CamposEditablesEstudio
  ): Promise<EstudioMedico | null> {
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