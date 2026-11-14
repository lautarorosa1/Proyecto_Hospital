export interface EvolucionMedica {
  id: number;
  pacienteId: number;
  fecha: string; // YYYY-MM-DD
  motivoConsulta: string;
  observaciones: string;
  indicaciones: string | null;
  fechaRegistro: Date;
}