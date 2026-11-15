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
  /** Insumo del inventario que se consume en cada dosis (Recursos y Camas). */
  insumoId?: number;
  /** Unidades de insumo por dosis (default 1). */
  cantidadInsumo?: number;
}