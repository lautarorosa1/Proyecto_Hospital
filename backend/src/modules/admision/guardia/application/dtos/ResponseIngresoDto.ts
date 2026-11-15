import type { EstadoIngreso } from '../../domain/IngresoGuardia';
import type { NivelTriaje } from '../../domain/NivelTriaje';

export interface ResponseIngresoDto {
  id: number;
  pacienteId: number;
  enfermeroId: number;
  nivelTriaje: NivelTriaje;
  /** Texto del nivel (ej. "Riesgo Vital" para rojo). */
  etiquetaNivel: string;
  /** 1 = más urgente. */
  prioridad: number;
  motivoConsulta: string;
  observaciones?: string;
  estado: EstadoIngreso;
  ingresadoEn: string; // ISO
  /** Lugar en la cola de espera (1 = el próximo). Solo si está "en_espera". */
  posicion?: number;
}

export interface ResponseRegistroIngresoDto {
  ingreso: ResponseIngresoDto;
  /** Pacientes de menor riesgo que quedaron detrás del recién ingresado. */
  desplazados: number;
  /** Médicos de guardia disponibles a los que se les emitió la alerta (solo Riesgo Vital). */
  medicosAlertados: number[];
}
