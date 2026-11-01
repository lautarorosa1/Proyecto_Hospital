export interface Alergia {
  id: number;
  alergeno: string;
  reaccion: string;
  severidad: 'leve' | 'moderada' | 'alta';
  fechaRegistro: Date;
  pacienteId: number;
}