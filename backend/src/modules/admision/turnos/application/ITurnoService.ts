import { ResponseTurnoDto } from './dtos/ResponseTurnoDto';
import { CrearTurnoDto } from './dtos/CrearTurnoDto';
import { ReservarTurnoDto } from './dtos/ReservarTurnoDto';
import { FiltrosTurnoDto } from './dtos/FiltrosTurnoDto';
import { CrearEntreturnoDto } from './dtos/CrearEntreturnoDto';
import { ResponseEntreturnoDto } from './dtos/ResponseEntreturnoDto';

export interface ITurnoService {
  getAll(filtros?: FiltrosTurnoDto): Promise<ResponseTurnoDto[]>;
  getDisponibles(filtros?: FiltrosTurnoDto): Promise<ResponseTurnoDto[]>;
  getById(id: number): Promise<ResponseTurnoDto>;
  crear(dto: CrearTurnoDto): Promise<ResponseTurnoDto>;
  crearEntreturno(dto: CrearEntreturnoDto): Promise<ResponseEntreturnoDto>;
  reservar(id: number, dto: ReservarTurnoDto): Promise<ResponseTurnoDto>;
  confirmar(id: number): Promise<ResponseTurnoDto>;
  registrarLlegada(id: number): Promise<ResponseTurnoDto>;
  atender(id: number): Promise<ResponseTurnoDto>;
  cancelar(id: number): Promise<ResponseTurnoDto>;
}
