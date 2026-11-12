/**
 * Registro de una dosis administrada. Vincula al enfermero que la aplicó y el
 * horario programado al que corresponde (una dosis programada se administra una sola vez).
 */
export interface AdministracionMedicacion {
  id: number;
  medicacionId: number;
  internacionId: number;
  enfermeroId: number;
  /** Horario de la indicación (p. ej. las 14:00 de "cada 8 horas"). */
  programadaPara: string; // ISO
  administradaEn: string; // ISO
  /** Unidades descontadas del inventario del piso (0 si la medicación no tiene insumo asociado). */
  cantidadDescontada: number;
}

/** Margen permitido entre el horario programado y la administración real. */
export const MARGEN_ADMINISTRACION_MIN = 30;

export function dentroDelMargen(
  programadaPara: Date,
  administradaEn: Date,
  margenMin: number = MARGEN_ADMINISTRACION_MIN,
): boolean {
  const difMin = Math.abs(administradaEn.getTime() - programadaPara.getTime()) / 60_000;
  return difMin <= margenMin;
}
