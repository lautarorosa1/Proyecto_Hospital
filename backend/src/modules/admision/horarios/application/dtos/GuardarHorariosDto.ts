export interface HorarioDto {
  diaSemana: number; // 1 = lunes ... 7 = domingo
  horaDesde: string; // "HH:mm"
  horaHasta: string; // "HH:mm"
}

/** Agenda semanal completa: reemplaza a la anterior. Vacío = sin horarios. */
export interface GuardarHorariosDto {
  horarios: HorarioDto[];
}
