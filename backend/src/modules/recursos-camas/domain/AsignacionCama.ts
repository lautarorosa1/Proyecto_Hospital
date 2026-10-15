export interface AsignacionCama {
  id: number;
  cama_id: number;
  paciente_id: number;
  fecha_asignacion: string;
  fecha_liberacion: string | null;
}