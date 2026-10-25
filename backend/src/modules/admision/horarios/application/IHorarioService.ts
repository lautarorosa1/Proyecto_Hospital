import { GuardarHorariosDto } from './dtos/GuardarHorariosDto';
import { ResponseHorarioDto } from './dtos/ResponseHorarioDto';

export interface IHorarioService {
  getByProfesional(profesionalId: number): Promise<ResponseHorarioDto[]>;
  guardar(
    profesionalId: number,
    dto: GuardarHorariosDto,
  ): Promise<ResponseHorarioDto[]>;
}
