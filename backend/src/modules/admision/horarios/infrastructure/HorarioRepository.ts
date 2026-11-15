import { Repository } from 'typeorm';
import type {
  HorarioProfesional,
  NuevoHorario,
} from '../domain/HorarioProfesional';
import type { IHorarioRepository } from '../domain/IHorarioRepository';
import { HorarioProfesionalEntity } from './HorarioProfesionalEntity';

export class HorarioRepository implements IHorarioRepository {
  constructor(private readonly repo: Repository<HorarioProfesionalEntity>) {}

  private toDomain = (entity: HorarioProfesionalEntity): HorarioProfesional => ({
    id: entity.id,
    profesionalId: entity.profesionalId,
    diaSemana: entity.diaSemana,
    horaDesde: entity.horaDesde,
    horaHasta: entity.horaHasta,
  });

  async findByProfesional(profesionalId: number): Promise<HorarioProfesional[]> {
    const entities = await this.repo.find({
      where: { profesionalId },
      order: { diaSemana: 'ASC', horaDesde: 'ASC' },
    });
    return entities.map(this.toDomain);
  }

  async findByProfesionalYDia(
    profesionalId: number,
    diaSemana: number,
  ): Promise<HorarioProfesional[]> {
    const entities = await this.repo.find({
      where: { profesionalId, diaSemana },
      order: { horaDesde: 'ASC' },
    });
    return entities.map(this.toDomain);
  }

  async reemplazar(
    profesionalId: number,
    horarios: NuevoHorario[],
  ): Promise<HorarioProfesional[]> {
    return this.repo.manager.transaction(async (manager) => {
      await manager.delete(HorarioProfesionalEntity, { profesionalId });

      if (horarios.length === 0) return [];

      const guardados = await manager.save(
        horarios.map((h) =>
          manager.create(HorarioProfesionalEntity, { profesionalId, ...h }),
        ),
      );

      return guardados
        .map(this.toDomain)
        .sort(
          (a, b) =>
            a.diaSemana - b.diaSemana || a.horaDesde.localeCompare(b.horaDesde),
        );
    });
  }
}
