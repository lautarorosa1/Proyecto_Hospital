export interface ReservarTurnoDto {
  pacienteId: number;
  /** Versión del turno que el cliente vio al listarlo (control de concurrencia). */
  version: number;
}
