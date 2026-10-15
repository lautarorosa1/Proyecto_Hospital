import { EstadoCama } from '../../domain/EstadoCama';

export interface ResponseCamaDto {
  id: number;
  numero: string;
  habitacion_id: number;
  estado: EstadoCama;
  version: number;
}