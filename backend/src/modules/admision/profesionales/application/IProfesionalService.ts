import { ResponseProfesionalDto } from './dtos/ResponseProfesionalDto';
import { CreateProfesionalDto } from './dtos/CreateProfesionalDto';
import { UpdateProfesionalDto } from './dtos/UpdateProfesionalDto';
import { FiltrosProfesionalDto } from './dtos/FiltrosProfesionalDto';

export interface IProfesionalService {
  getAll(filtros?: FiltrosProfesionalDto): Promise<ResponseProfesionalDto[]>;
  getById(id: number): Promise<ResponseProfesionalDto>;
  create(dto: CreateProfesionalDto): Promise<ResponseProfesionalDto>;
  update(id: number, dto: UpdateProfesionalDto): Promise<ResponseProfesionalDto>;
  /** Baja lógica: pasa el profesional a estado "inactivo". */
  remove(id: number): Promise<void>;
}
