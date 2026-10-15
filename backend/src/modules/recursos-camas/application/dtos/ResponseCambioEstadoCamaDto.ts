import { ResponseAsignacionCamaDto } from './ResponseAsignacionCamaDto';
import { ResponseCamaDto } from './ResponseCamaDto';
import { ResponseHistorialEstadoCamaDto } from './ResponseHistorialEstadoCamaDto';

export interface ResponseCambioEstadoCamaDto {
  cama: ResponseCamaDto;
  historial: ResponseHistorialEstadoCamaDto;
  asignacion: ResponseAsignacionCamaDto | null;
}