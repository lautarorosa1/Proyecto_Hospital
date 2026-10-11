import { FindOptionsWhere, Repository } from 'typeorm';
import type { Profesional } from '../domain/Profesional';
import type {
  FiltrosProfesional,
  IProfesionalRepository,
} from '../domain/IProfesionalRepository';
import { ProfesionalEntity } from './ProfesionalEntity';

export class ProfesionalRepository implements IProfesionalRepository {
  constructor(private readonly repo: Repository<ProfesionalEntity>) {}

  private toDomain = (entity: ProfesionalEntity): Profesional => ({
    id: entity.id,
    usuarioId: entity.usuarioId,
    especialidadId: entity.especialidadId,
    nombre: entity.nombre,
    apellido: entity.apellido,
    dni: entity.dni,
    email: entity.email,
    telefono: entity.telefono ?? undefined,
    matricula: entity.matricula,
    tipoProfesional: entity.tipoProfesional,
    estado: entity.estado,
  });

  async findAll(filtros: FiltrosProfesional = {}): Promise<Profesional[]> {
    const where: FindOptionsWhere<ProfesionalEntity> = {};
    if (filtros.estado !== undefined) where.estado = filtros.estado;
    if (filtros.tipoProfesional !== undefined) {
      where.tipoProfesional = filtros.tipoProfesional;
    }
    if (filtros.especialidadId !== undefined) {
      where.especialidadId = filtros.especialidadId;
    }

    const entities = await this.repo.find({
      where,
      order: { apellido: 'ASC', nombre: 'ASC' },
    });
    return entities.map(this.toDomain);
  }

  async findById(id: number): Promise<Profesional | null> {
    const entity = await this.repo.findOneBy({ id });
    return entity ? this.toDomain(entity) : null;
  }

  async findByDni(dni: string): Promise<Profesional | null> {
    const entity = await this.repo.findOneBy({ dni });
    return entity ? this.toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<Profesional | null> {
    const entity = await this.repo.findOneBy({ email });
    return entity ? this.toDomain(entity) : null;
  }

  async findByMatricula(matricula: string): Promise<Profesional | null> {
    const entity = await this.repo.findOneBy({ matricula });
    return entity ? this.toDomain(entity) : null;
  }

  async findByUsuarioId(usuarioId: number): Promise<Profesional | null> {
    const entity = await this.repo.findOneBy({ usuarioId });
    return entity ? this.toDomain(entity) : null;
  }

  async create(data: Omit<Profesional, 'id'>): Promise<Profesional> {
    const entity = this.repo.create(data);
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async update(
    id: number,
    data: Partial<Omit<Profesional, 'id'>>,
  ): Promise<Profesional | null> {
    const entity = await this.repo.findOneBy({ id });
    if (!entity) return null;
    this.repo.merge(entity, data);
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }
}
