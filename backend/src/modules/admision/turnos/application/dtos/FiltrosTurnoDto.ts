/** Filtros opcionales para listar turnos (llegan como query params). */
export interface FiltrosTurnoDto {
  profesionalId?: number;
  pacienteId?: number;
  fecha?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  estado?: string;
}
