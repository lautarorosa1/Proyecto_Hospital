import type { ResponseTurnoDto } from '../../../admision/turnos/application/dtos/ResponseTurnoDto';
import type { TipoNotificacion } from '../../domain/NotificacionConsultorio';

export interface AbrirConsultorioDto {
  profesionalId: number;
  habitacionId: number;
}

export interface OcupacionDto {
  id: number;
  profesionalId: number;
  habitacionId: number;
  habitacion: { numero: string; piso: string; sector: string };
  iniciadaEn: string; // ISO
}

/** Un consultorio (habitación de tipo CONSULTORIO) y quién lo ocupa ahora, si alguien. */
export interface ConsultorioEstadoDto {
  id: number;
  numero: string;
  piso: string;
  sector: string;
  ocupacion: null | {
    ocupacionId: number;
    profesionalId: number;
    profesionalNombre: string;
    iniciadaEn: string; // ISO
  };
}

export interface PacienteResumenDto {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
}

export type TurnoConsultorioDto = ResponseTurnoDto & { paciente?: PacienteResumenDto };

export interface AgendaConsultorioDto {
  fecha: string;
  profesionalId: number;
  turnos: TurnoConsultorioDto[];
  /** Cantidad de turnos por estado (para los contadores de la pantalla). */
  resumen: {
    programado: number;
    confirmado: number;
    en_sala_espera: number;
    atendido: number;
    cancelado: number;
  };
}

export interface NotificacionDto {
  id: number;
  profesionalId: number;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  referenciaId?: number;
  leida: boolean;
  creadaEn: string; // ISO
}
