import { AsignarCamaDto } from './dtos/AsignarCamaDto';
import { CambiarEstadoCamaDto } from './dtos/CambiarEstadoCamaDto';
import { CreateCamaDto } from './dtos/CreateCamaDto';
import { FiltrosMapaCamaDto } from './dtos/FiltrosMapaCamaDto';
import { PasarALimpiezaDto } from './dtos/PasarALimpiezaDto';
import { ResponseAsignarCamaDto } from './dtos/ResponseAsignarCamaDto';
import { ResponseCamaDto } from './dtos/ResponseCamaDto';
import { ResponseCamaMapaDto } from './dtos/ResponseCamaMapaDto';
import { ResponseCambioEstadoCamaDto } from './dtos/ResponseCambioEstadoCamaDto';

export interface ICamaService {
  crear(dto: CreateCamaDto): Promise<ResponseCamaDto>;
  obtener(id: number): Promise<ResponseCamaDto>;
  mapa(filtro: FiltrosMapaCamaDto): Promise<ResponseCamaMapaDto[]>;
  asignar(id: number, dto: AsignarCamaDto): Promise<ResponseAsignarCamaDto>;
  cambiarEstado(id: number, dto: CambiarEstadoCamaDto): Promise<ResponseCambioEstadoCamaDto>;
  pasarAEnLimpieza(id: number, dto: PasarALimpiezaDto): Promise<ResponseCambioEstadoCamaDto>;
}