import { Repository } from 'typeorm';
import type { Paciente } from '../domain/Paciente';
import type { IPacienteRepository } from '../domain/IPacienteRepository';
import { PacienteEntity } from './PacienteEntity';

export class PacienteRepository implements IPacienteRepository {
  constructor(private readonly repo: Repository<PacienteEntity>) {}

  private toDomain = (entity: PacienteEntity): Paciente => ({
    id: entity.id,
    nombre: entity.nombre,
    apellido: entity.apellido,
    dni: entity.dni,
    email: entity.email,
    fechaNacimiento: entity.fechaNacimiento,
    telefono: entity.telefono ?? undefined,
    direccion: entity.direccion ?? undefined,
  });

  async findAll(): Promise<Paciente[]> {
    const entities = await this.repo.find();
    return entities.map(this.toDomain);
  }

  async findById(id: number): Promise<Paciente | null> {
    const entity = await this.repo.findOneBy({ id });
    return entity ? this.toDomain(entity) : null;
  }

  async findByDni(dni: string): Promise<Paciente | null> {
    const entity = await this.repo.findOneBy({ dni });
    return entity ? this.toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<Paciente | null> {
    const entity = await this.repo.findOneBy({ email });
    return entity ? this.toDomain(entity) : null;
  }

  async create(data: Omit<Paciente, 'id'>): Promise<Paciente> {
    const entity = this.repo.create(data);
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async update(
    id: number,
    data: Partial<Omit<Paciente, 'id'>>,
  ): Promise<Paciente | null> {
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