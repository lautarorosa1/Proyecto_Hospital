export interface SignosVitales {
  id: number;
  internacionId: number;
  profesionalId: number;
  fechaHora: string;

  temperatura: number;
  frecuenciaCardiaca: number;
  frecuenciaRespiratoria: number;
  presionSistolica: number;
  presionDiastolica: number;
  saturacionOxigeno: number;

  observaciones?: string;
  /** true si algún valor está fuera de rango (temperatura > 39 °C): el front lo muestra en rojo. */
  alerta?: boolean;
}

export function requiereAlertaTemperatura(
  temperatura: number
): boolean {
  return temperatura > 39;
}