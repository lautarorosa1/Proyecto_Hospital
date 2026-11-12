export const TIPOS_EVENTO_CLINICO = [
  'INGRESO',
  'SIGNOS_VITALES',
  'MEDICACION_ADMINISTRADA',
  'ALTA',
] as const;

export type TipoEventoClinico = (typeof TIPOS_EVENTO_CLINICO)[number];

/** Entrada de la línea de tiempo clínica del paciente (alimentada por otros módulos). */
export interface EventoClinico {
  id: number;
  pacienteId: number;
  tipo: TipoEventoClinico;
  resumen: string;
  /** Id del registro de origen en el módulo que lo generó (internación, signos vitales...). */
  referenciaId?: number;
  /** Marca los registros fuera de rango (por ej. fiebre alta). */
  alerta: boolean;
  fecha: Date;
}

export type NuevoEventoClinico = Omit<EventoClinico, 'id'>;
