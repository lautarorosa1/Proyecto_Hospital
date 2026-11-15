import { Repository } from 'typeorm';
import type {
  IngresoGuardia,
  NuevoIngresoGuardia,
} from '../domain/IngresoGuardia';
import type { IIngresoGuardiaRepository } from '../domain/IIngresoGuardiaRepository';
import { IngresoGuardiaEntity } from './IngresoGuardiaEntity';

export class IngresoGuardiaRepository implements IIngresoGuardiaRepository {
  constructor(private readonly repo: Repository<IngresoGuardiaEntity>) {}

  private toDomain = (e: IngresoGuardiaEntity): IngresoGuardia => ({
    id: e.id,
    pacienteId: e.pacienteId,
    enfermeroId: e.enfermeroId,
    nivelTriaje: e.nivelTriaje,
    prioridad: e.prioridad,
    motivoConsulta: e.motivoConsulta,
    observaciones: e.observaciones ?? undefined,
    estado: e.estado,
    ingresadoEn: e.ingresadoEn,
  });

  async create(data: NuevoIngresoGuardia): Promise<IngresoGuardia> {
    const entity = this.repo.create({ ...data, estado: 'en_espera' });
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async findById(id: number): Promise<IngresoGuardia | null> {
    const entity = await this.repo.findOneBy({ id });
    return entity ? this.toDomain(entity) : null;
  }

  async findActivoByPaciente(
    pacienteId: number,
  ): Promise<IngresoGuardia | null> {
    const entity = await this.repo
      .createQueryBuilder('i')
      .where('i.paciente_id = :pacienteId', { pacienteId })
      .andWhere('i.estado IN (:...estados)', {
        estados: ['en_espera', 'en_atencion'],
      })
      .getOne();
    return entity ? this.toDomain(entity) : null;
  }

  async findCola(): Promise<IngresoGuardia[]> {
    const entities = await this.repo.find({
      where: { estado: 'en_espera' },
      // El id desempata si dos ingresos caen en el mismo instante.
      order: { prioridad: 'ASC', ingresadoEn: 'ASC', id: 'ASC' },
    });
    return entities.map(this.toDomain);
  }
}
