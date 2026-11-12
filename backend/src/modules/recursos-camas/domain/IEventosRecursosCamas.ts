import type { EstadoCama } from './EstadoCama';

export interface EventoCambioEstadoCama {
  cama_id: number;
  estado_anterior: EstadoCama;
  estado_nuevo: EstadoCama;
  usuario_id: number;
  fecha_cambio: string;
  version: number;
}

export interface EventoAsignacionCama {
  cama_id: number;
  paciente_id: number;
  usuario_id: number;
  fecha_asignacion: string;
}

/**
 * Puerto de salida de Recursos y Camas. La implementación decide el canal
 * (hoy, el bus de eventos de dominio). `publicarAsignacion` es opcional para
 * no obligar a quienes solo escuchan los cambios de estado.
 */
export interface IPublicadorEstadoCama {
  publicarCambioEstado(evento: EventoCambioEstadoCama): Promise<void>;
  publicarAsignacion?(evento: EventoAsignacionCama): Promise<void>;
}

/**
 * Puerto hacia Atención y Enfermería: una cama solo se asigna a un paciente
 * que ya fue ingresado (tiene una internación activa). Se conecta en la
 * composición de módulos para no acoplar Recursos con Enfermería.
 */
export interface IVerificadorIngreso {
  tieneInternacionActiva(pacienteId: number): Promise<boolean>;
}
