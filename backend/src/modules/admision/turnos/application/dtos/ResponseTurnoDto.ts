import type { EstadoTurno } from '../../domain/Turno';

export interface ResponseTurnoDto {
  id: number;
  profesionalId: number;
  pacienteId?: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  duracionMin: number;
  estado: EstadoTurno;
  version: number;

  /** true si este turno es un entreturno (urgencia menor). */
  esEntreturno: boolean;
  /** true si un entreturno le recortó tiempo: el front lo etiqueta visualmente. */
  reducido: boolean;
  /** Duración que tenía antes del recorte (solo si `reducido`). */
  duracionOriginalMin?: number;
  reducidoPorEntreturnoId?: number;
  /** Texto de aviso para el médico (solo si `reducido`). */
  advertencia?: string;
}
