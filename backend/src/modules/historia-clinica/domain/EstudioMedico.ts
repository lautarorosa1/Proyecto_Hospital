export interface EstudioMedico {
  id: number;
  pacienteId: number;
  fecha: string; // YYYY-MM-DD
  tipoEstudio: string;
  descripcion: string;
  resultado: string | null;
  fechaRegistro: Date;
}