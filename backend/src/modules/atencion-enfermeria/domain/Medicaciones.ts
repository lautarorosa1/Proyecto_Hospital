export interface Medicacion {
  id: number;
  internacionId: number;
  profesionalId: number;
  nombre: string;
  dosis: string;
  frecuencia: string;
  viaAdministracion: string;
  fechaInicio: string;
  fechaFin?: string;
  estado: 'ACTIVA' | 'SUSPENDIDA' | 'FINALIZADA';
  observaciones?: string;
}