import { ResponseAsignacionCamaDto } from './ResponseAsignacionCamaDto';
import { ResponseCamaDto } from './ResponseCamaDto';
import { ResponseHistorialEstadoCamaDto } from './ResponseHistorialEstadoCamaDto';

export interface ResponseAsignarCamaDto {
  cama: ResponseCamaDto;
  historial: ResponseHistorialEstadoCamaDto;
  asignacion: ResponseAsignacionCamaDto;
}