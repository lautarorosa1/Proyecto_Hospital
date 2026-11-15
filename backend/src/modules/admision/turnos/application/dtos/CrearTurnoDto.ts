/**
 * Crea un turno disponible. La duración no se envía: la define el profesional
 * (campo duracionTurnoMin) y queda guardada en el turno al crearlo.
 */
export interface CrearTurnoDto {
  profesionalId: number;
  fecha: string; // "YYYY-MM-DD"
  horaInicio: string; // "HH:mm"
}
