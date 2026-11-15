import type { TipoIngreso } from '../../../shared/domain/events/DomainEvents';

export interface Internacion {
  id: number;
  pacienteId: number;
  fechaIngreso: string;
  fechaEgreso?: string;
  motivoIngreso: string;
  estado: 'ACTIVA' | 'FINALIZADA';
  observaciones?: string;
  /** Define qué protocolo de cuidados se arma al ingresar (patrón Builder). Default: GENERAL. */
  tipoIngreso?: TipoIngreso;
  /** Cama asignada por Recursos y Camas (evento CAMA_ASIGNADA). */
  camaId?: number;
}