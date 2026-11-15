/**
 * HU 3.1. Registra y clasifica (triaje) a un paciente que llega a la guardia
 * sin turno previo.
 */
export interface RegistrarIngresoDto {
  pacienteId: number;
  /** Profesional de tipo enfermero que realiza la evaluación de triaje. */
  enfermeroId: number;
  /** "rojo" (Riesgo Vital) | "naranja" | "amarillo" | "verde" | "azul" */
  nivelTriaje: string;
  motivoConsulta: string;
  observaciones?: string;
}
