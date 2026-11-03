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
}

export function requiereAlertaTemperatura(
  temperatura: number
): boolean {
  return temperatura > 39;
}