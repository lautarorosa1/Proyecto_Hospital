import { ResponsePacienteDto } from './dtos/ResponsePacienteDto';
import { CreatePacienteDto } from './dtos/CreatePacienteDto';
import { UpdatePacienteDto } from './dtos/UpdatePacienteDto';

export interface IPacienteService {
  getAll(): Promise<ResponsePacienteDto[]>;
  getById(id: number): Promise<ResponsePacienteDto>;
  create(dto: CreatePacienteDto): Promise<ResponsePacienteDto>;
  update(id: number, dto: UpdatePacienteDto): Promise<ResponsePacienteDto>;
  remove(id: number): Promise<void>;
}