export interface AntecedenteFamiliar {
  id: number;
  pacienteId: number;
  parentesco: string;
  enfermedad: string;
  observaciones: string | null;
  fechaRegistro: Date;
}