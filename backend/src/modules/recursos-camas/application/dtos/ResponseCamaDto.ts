import { EstadoCama } from '../../domain/EstadoCama';

export interface ResponseCamaDto {
  id: number;
  habitacion_id: number;
  estado: EstadoCama;
}
