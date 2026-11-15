// Un rango de atención de un profesional en un día de la semana.
// Un profesional puede tener varios rangos el mismo día (ej: mañana y tarde).
export interface HorarioProfesional {
  id: number;
  profesionalId: number;
  diaSemana: number; // 1 = lunes ... 7 = domingo (ISO)
  horaDesde: string; // "HH:mm"
  horaHasta: string; // "HH:mm"
}

export type NuevoHorario = Omit<HorarioProfesional, 'id' | 'profesionalId'>;
