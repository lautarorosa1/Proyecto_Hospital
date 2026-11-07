export enum DomainEvents {
  MEDICACION_ADMINISTRADA = 'MEDICACION_ADMINISTRADA',
  PACIENTE_INGRESADO = 'PACIENTE_INGRESADO',
  PACIENTE_DADO_DE_ALTA = 'PACIENTE_DADO_DE_ALTA',
  TURNO_CANCELADO = 'TURNO_CANCELADO',
  SIGNOS_VITALES_ALERTA = 'SIGNOS_VITALES_ALERTA',
}

export interface MedicacionAdministradaPayload {
  indicacionId: string | number;
  insumoId: string | number;
  cantidad: number;
  enfermeroId: string | number;
  pacienteId: string | number;
  timestamp: Date;
}

export interface PacienteIngresadoPayload {
  pacienteId: string | number;
  camaId: string | number;
  tipoIngreso: string;
  timestamp: Date;
}

export interface PacienteDadoDeAltaPayload {
  pacienteId: string | number;
  camaId: string | number;
  timestamp: Date;
}

export interface TurnoCanceladoPayload {
  turnoId: string | number;
  profesionalId: string | number;
  fecha: Date | string;
}

export interface SignosVitalesAlertaPayload {
  pacienteId: string | number;
  internacionId: string | number;
  temperatura: number;
  enfermeroId: string | number;
  timestamp: Date;
}

export interface EventPayloads {
  [DomainEvents.MEDICACION_ADMINISTRADA]: MedicacionAdministradaPayload;
  [DomainEvents.PACIENTE_INGRESADO]: PacienteIngresadoPayload;
  [DomainEvents.PACIENTE_DADO_DE_ALTA]: PacienteDadoDeAltaPayload;
  [DomainEvents.TURNO_CANCELADO]: TurnoCanceladoPayload;
  [DomainEvents.SIGNOS_VITALES_ALERTA]: SignosVitalesAlertaPayload;
}

