import type { EstadoCama } from './EstadoCama';

export const EVENTO_CAMBIO_ESTADO_CAMA = 'recursos-camas.cama.estado-cambiado';
export const EVENTO_MEDICACION_ADMINISTRADA = 'recursos-camas.medicacion.administrada';

export interface EventoCambioEstadoCama {
  cama_id: number;
  estado_anterior: EstadoCama;
  estado_nuevo: EstadoCama;
  usuario_id: number;
  fecha_cambio: string;
  version: number;
}

export interface EventoMedicacionAdministrada {
  insumo_id: number;
  cantidad: number;
  referencia_id: number;
}

export interface IPublicadorEstadoCama {
  publicarCambioEstado(evento: EventoCambioEstadoCama): Promise<void>;
}

export interface BusEventosEnchufable {
  publicar(nombre: string, payload: unknown): Promise<void>;
  suscribir(nombre: string, handler: (payload: unknown) => Promise<void>): void;
}