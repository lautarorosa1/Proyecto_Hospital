import { IHabitacionService } from './IHabitacionService';
import { IHabitacionRepository } from '../domain/IHabitacionRepository';
import { Habitacion } from '../domain/Habitacion';
import { CreateHabitacionDto } from './dtos/CreateHabitacionDto';
import { UpdateHabitacionDto } from './dtos/UpdateHabitacionDto';
import { ResponseHabitacionDto } from './dtos/ResponseHabitacionDto';
import { BadRequestError, NotFoundError } from '../../../shared/errors';

type HabitacionData = Omit<Habitacion, 'id'>;

export class HabitacionService implements IHabitacionService {
  constructor(private readonly habitacionRepository: IHabitacionRepository) {}

  private toDto(habitacion: Habitacion): ResponseHabitacionDto {
    return {
      id: habitacion.id,
      numero: habitacion.numero,
      piso: habitacion.piso,
      sector: habitacion.sector,
    };
  }

  private exigirTexto(valor: unknown, campo: string): string {
    if (typeof valor !== 'string' || valor.trim() === '') {
      throw new BadRequestError(`El ${campo} es obligatorio`);
    }
    return valor.trim();
  }

  async getAll(): Promise<ResponseHabitacionDto[]> {
    const habitaciones = await this.habitacionRepository.findAll();
    return habitaciones.map((habitacion) => this.toDto(habitacion));
  }

  async getById(id: number): Promise<ResponseHabitacionDto> {
    const habitacion = await this.habitacionRepository.findById(id);
    if (!habitacion) throw new NotFoundError('Habitación no encontrada');
    return this.toDto(habitacion);
  }

  async create(dto: CreateHabitacionDto): Promise<ResponseHabitacionDto> {
    const data: HabitacionData = {
      numero: this.exigirTexto(dto?.numero, 'número'),
      piso: this.exigirTexto(dto?.piso, 'piso'),
      sector: this.exigirTexto(dto?.sector, 'sector'),
    };
    const habitacion = await this.habitacionRepository.create(data);
    return this.toDto(habitacion);
  }

  async update(id: number, dto: UpdateHabitacionDto): Promise<ResponseHabitacionDto> {
    const existente = await this.habitacionRepository.findById(id);
    if (!existente) throw new NotFoundError('Habitación no encontrada');

    const changes: Partial<HabitacionData> = {};
    if (dto?.numero !== undefined) changes.numero = this.exigirTexto(dto.numero, 'número');
    if (dto?.piso !== undefined) changes.piso = this.exigirTexto(dto.piso, 'piso');
    if (dto?.sector !== undefined) changes.sector = this.exigirTexto(dto.sector, 'sector');

    const actualizada = await this.habitacionRepository.update(id, changes);
    if (!actualizada) throw new NotFoundError('Habitación no encontrada');
    return this.toDto(actualizada);
  }

  async remove(id: number): Promise<void> {
    const deleted = await this.habitacionRepository.delete(id);
    if (!deleted) throw new NotFoundError('Habitación no encontrada');
  }
}