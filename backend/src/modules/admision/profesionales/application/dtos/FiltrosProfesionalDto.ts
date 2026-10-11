/** Filtros opcionales para el listado (llegan como query params). */
export interface FiltrosProfesionalDto {
  estado?: string;
  tipoProfesional?: string;
  especialidadId?: number;
}
