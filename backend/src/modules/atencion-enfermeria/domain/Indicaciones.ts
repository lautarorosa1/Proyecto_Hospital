export interface Indicacion {
  id: number;
  internacionId: number;
  profesionalId: number;
  descripcion: string;
  fecha: string;
  estado: 'ACTIVA' | 'CUMPLIDA' | 'SUSPENDIDA';
  observaciones?: string;
}