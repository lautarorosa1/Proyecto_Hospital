export interface ConfirmarIngresoDto {
  pacienteId: number;
  /** CIRUGIA_PROGRAMADA | INFECCION_RESPIRATORIA | GENERAL. Si falta, se infiere del diagnóstico. */
  tipoIngreso?: string;
  motivoIngreso: string;
  diagnosticoInicial?: string;
  /** Usuario de admisión que confirma el traslado. */
  usuarioId?: number;
}
