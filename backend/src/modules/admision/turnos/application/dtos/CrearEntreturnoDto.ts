/**
 * HU 1.2. Inserta un entreturno (urgencia menor) en la agenda de un
 * profesional, recortando los turnos que se superponen.
 */
export interface CrearEntreturnoDto {
  profesionalId: number;
  pacienteId: number;
  fecha: string; // "YYYY-MM-DD"
  horaInicio: string; // "HH:mm"
  /** Opcional. Por defecto 15 min. */
  duracionMin?: number;
}
