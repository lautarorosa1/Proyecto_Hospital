import { Repository } from 'typeorm';
import { ConflictError } from '../../../shared/errors';
import type { OcupacionConsultorio } from '../domain/OcupacionConsultorio';
import type { IOcupacionRepository } from '../domain/IOcupacionRepository';
import { OcupacionConsultorioEntity } from './OcupacionConsultorioEntity';

export class OcupacionRepository implements IOcupacionRepository {
  constructor(private readonly repo: Repository<OcupacionConsultorioEntity>) {}

  private toDomain(e: OcupacionConsultorioEntity): OcupacionConsultorio {
    return {
      id: e.id,
      habitacionId: e.habitacionId,
      profesionalId: e.profesionalId,
      estado: e.estado,
      iniciadaEn: e.iniciadaEn,
      finalizadaEn: e.finalizadaEn ?? undefined,
    };
  }

  async abrir(habitacionId: number, profesionalId: number): Promise<OcupacionConsultorio> {
    try {
      const guardada = await this.repo.save(
        this.repo.create({ habitacionId, profesionalId, estado: 'activa', iniciadaEn: new Date() }),
      );
      return this.toDomain(guardada);
    } catch (error) {
      const code = (error as { driverError?: { code?: string } })?.driverError?.code;
      if (code === '23505') {
        throw new ConflictError(
          'El consultorio acaba de ser ocupado o el profesional ya tiene un consultorio abierto',
        );
      }
      throw error;
    }
  }

  async findActivaByProfesional(profesionalId: number): Promise<OcupacionConsultorio | null> {
    const e = await this.repo.findOneBy({ profesionalId, estado: 'activa' });
    return e ? this.toDomain(e) : null;
  }

  async findActivaByHabitacion(habitacionId: number): Promise<OcupacionConsultorio | null> {
    const e = await this.repo.findOneBy({ habitacionId, estado: 'activa' });
    return e ? this.toDomain(e) : null;
  }

  async findActivas(): Promise<OcupacionConsultorio[]> {
    return (await this.repo.findBy({ estado: 'activa' })).map((e) => this.toDomain(e));
  }

  async finalizar(id: number): Promise<boolean> {
    const r = await this.repo.update(
      { id, estado: 'activa' },
      { estado: 'finalizada', finalizadaEn: new Date() },
    );
    return (r.affected ?? 0) > 0;
  }
}
