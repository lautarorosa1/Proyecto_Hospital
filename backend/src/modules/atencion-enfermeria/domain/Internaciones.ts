export interface Internacion {
  id: number;
  pacienteId: number;
  fechaIngreso: string;
  fechaEgreso?: string;
  motivoIngreso: string;
  estado: 'ACTIVA' | 'FINALIZADA';
  observaciones?: string;
}