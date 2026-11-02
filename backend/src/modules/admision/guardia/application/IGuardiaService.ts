import { RegistrarIngresoDto } from './dtos/RegistrarIngresoDto';
import {
  ResponseIngresoDto,
  ResponseRegistroIngresoDto,
} from './dtos/ResponseIngresoDto';

export interface IGuardiaService {
  registrarIngreso(dto: RegistrarIngresoDto): Promise<ResponseRegistroIngresoDto>;
  getIngreso(id: number): Promise<ResponseIngresoDto>;
  /** Cola de espera ordenada por prioridad y llegada. */
  getCola(): Promise<ResponseIngresoDto[]>;
}
