import { ResponseHabitacionDto } from './dtos/ResponseHabitacionDto';
import { CreateHabitacionDto } from './dtos/CreateHabitacionDto';
import { UpdateHabitacionDto } from './dtos/UpdateHabitacionDto';

export interface IHabitacionService {
  getAll(): Promise<ResponseHabitacionDto[]>;
  getById(id: number): Promise<ResponseHabitacionDto>;
  create(dto: CreateHabitacionDto): Promise<ResponseHabitacionDto>;
  update(id: number, dto: UpdateHabitacionDto): Promise<ResponseHabitacionDto>;
  remove(id: number): Promise<void>;
}