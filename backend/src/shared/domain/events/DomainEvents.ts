/**
 * Catálogo único de eventos de dominio del hospital. Es el contrato entre
 * módulos: ningún módulo importa clases de otro, solo publica/escucha estos
 * eventos a través de IEventBus (patrón Observer).
 *
 * Mapa de interacciones:
 *
 *  Admisión ──PACIENTE_INGRESADO──────────────► Enfermería (crea internación + protocolo) ► HCE
 *  Recursos ──CAMA_ASIGNADA───────────────────► Enfermería (vincula cama a la internación)
 *  Enfermería ──MEDICACION_ADMINISTRADA───────► Recursos (descuenta insumo) ► HCE
 *  Enfermería ──SIGNOS_VITALES_REGISTRADO─────► HCE
 *  Enfermería ──SIGNOS_VITALES_ALERTA─────────► Admisión/Guardia (monitores médicos)
 *  Enfermería ──PACIENTE_DADO_DE_ALTA─────────► Recursos (cama a "En limpieza") ► HCE
 *  Recursos ──CAMA_ESTADO_CAMBIADO────────────► monitores en tiempo real (SSE)
 *  Admisión ──TURNO_CANCELADO / LISTA_ESPERA_PROMOVIDA, TURNO_PACIENTE_EN_SALA_ESPERA,
 *            TURNOS_REDUCIDOS, ALERTA_RIESGO_VITAL ► consultorios / recepción / guardia
 */
export enum DomainEvents {
  // Admisión
  PACIENTE_INGRESADO = 'PACIENTE_INGRESADO',
  TURNO_CANCELADO = 'TURNO_CANCELADO',
  LISTA_ESPERA_PROMOVIDA = 'LISTA_ESPERA_PROMOVIDA',
  TURNO_PACIENTE_EN_SALA_ESPERA = 'TURNO_PACIENTE_EN_SALA_ESPERA',
  TURNOS_REDUCIDOS = 'TURNOS_REDUCIDOS',
  ALERTA_RIESGO_VITAL = 'ALERTA_RIESGO_VITAL',

  // Atención y Enfermería
  INTERNACION_REGISTRADA = 'INTERNACION_REGISTRADA',
  MEDICACION_ADMINISTRADA = 'MEDICACION_ADMINISTRADA',
  SIGNOS_VITALES_REGISTRADO = 'SIGNOS_VITALES_REGISTRADO',
  SIGNOS_VITALES_ALERTA = 'SIGNOS_VITALES_ALERTA',
  PACIENTE_DADO_DE_ALTA = 'PACIENTE_DADO_DE_ALTA',

  // Recursos y Camas
  CAMA_ASIGNADA = 'CAMA_ASIGNADA',
  CAMA_ESTADO_CAMBIADO = 'CAMA_ESTADO_CAMBIADO',
}

export const TIPOS_INGRESO = [
  'CIRUGIA_PROGRAMADA',
  'INFECCION_RESPIRATORIA',
  'GENERAL',
] as const;
export type TipoIngreso = (typeof TIPOS_INGRESO)[number];

export function esTipoIngreso(valor: unknown): valor is TipoIngreso {
  return (
    typeof valor === 'string' && (TIPOS_INGRESO as readonly string[]).includes(valor)
  );
}

// ---------- Admisión ----------

export interface PacienteIngresadoPayload {
  pacienteId: number;
  tipoIngreso: TipoIngreso;
  motivoIngreso: string;
  diagnosticoInicial?: string;
  usuarioId?: number;
  timestamp: Date;
}

export interface TurnoCanceladoPayload {
  turnoId: number;
  profesionalId: number;
  pacienteId?: number;
  fecha: string;
  horaInicio: string;
  /** Slot nuevo que quedó disponible en el mismo horario. */
  turnoLiberadoId: number;
}

export interface ListaEsperaPromovidaPayload {
  esperaId: number;
  turnoId: number;
  pacienteId: number;
  pacienteNombre: string;
  profesionalId: number;
  fecha: string;
  horaInicio: string;
  /** Texto para el recepcionista: debe avisar al paciente. */
  mensaje: string;
}

export interface PacienteEnSalaEsperaPayload {
  turnoId: number;
  profesionalId: number;
  pacienteId?: number;
  fecha: string;
  horaInicio: string;
}

export interface TurnosReducidosPayload {
  entreturnoId: number;
  profesionalId: number;
  fecha: string;
  horaInicio: string;
  afectados: {
    turnoId: number;
    pacienteId?: number;
    horaInicioAnterior: string;
    horaInicioNueva: string;
    duracionAnteriorMin: number;
    duracionNuevaMin: number;
  }[];
}

export interface AlertaRiesgoVitalPayload {
  tipo: 'ALERTA_RIESGO_VITAL';
  severidad: 'critica';
  ingresoId: number;
  pacienteId: number;
  pacienteNombre: string;
  nivelTriaje: string;
  etiquetaNivel: string;
  motivoConsulta: string;
  ingresadoEn: string; // ISO
  medicosDestinatarios: number[];
}

// ---------- Atención y Enfermería ----------

export interface InternacionRegistradaPayload {
  internacionId: number;
  pacienteId: number;
  tipoIngreso: TipoIngreso;
  protocoloId?: number;
  timestamp: Date;
}

export interface MedicacionAdministradaPayload {
  administracionId: number;
  medicacionId: number;
  internacionId: number;
  pacienteId: number;
  insumoId: number;
  cantidad: number;
  enfermeroId: number;
  timestamp: Date;
}

export interface SignosVitalesRegistradoPayload {
  signosVitalesId: number;
  internacionId: number;
  pacienteId: number;
  enfermeroId: number;
  temperatura: number;
  frecuenciaCardiaca: number;
  frecuenciaRespiratoria: number;
  presionSistolica: number;
  presionDiastolica: number;
  saturacionOxigeno: number;
  alerta: boolean;
  timestamp: Date;
}

export interface SignosVitalesAlertaPayload {
  signosVitalesId: number;
  pacienteId: number;
  internacionId: number;
  temperatura: number;
  enfermeroId: number;
  camaId?: number;
  /** Sector de internación donde está el paciente (si ya tiene cama). */
  sector?: string;
  severidad: 'alta';
  timestamp: Date;
}

export interface PacienteDadoDeAltaPayload {
  pacienteId: number;
  internacionId: number;
  camaId?: number;
  usuarioId?: number;
  timestamp: Date;
}

// ---------- Recursos y Camas ----------

export interface CamaAsignadaPayload {
  camaId: number;
  pacienteId: number;
  usuarioId: number;
  timestamp: Date;
}

export interface CamaEstadoCambiadoPayload {
  camaId: number;
  estadoAnterior: string;
  estadoNuevo: string;
  usuarioId: number;
  timestamp: Date;
}

export interface EventPayloads {
  [DomainEvents.PACIENTE_INGRESADO]: PacienteIngresadoPayload;
  [DomainEvents.TURNO_CANCELADO]: TurnoCanceladoPayload;
  [DomainEvents.LISTA_ESPERA_PROMOVIDA]: ListaEsperaPromovidaPayload;
  [DomainEvents.TURNO_PACIENTE_EN_SALA_ESPERA]: PacienteEnSalaEsperaPayload;
  [DomainEvents.TURNOS_REDUCIDOS]: TurnosReducidosPayload;
  [DomainEvents.ALERTA_RIESGO_VITAL]: AlertaRiesgoVitalPayload;
  [DomainEvents.INTERNACION_REGISTRADA]: InternacionRegistradaPayload;
  [DomainEvents.MEDICACION_ADMINISTRADA]: MedicacionAdministradaPayload;
  [DomainEvents.SIGNOS_VITALES_REGISTRADO]: SignosVitalesRegistradoPayload;
  [DomainEvents.SIGNOS_VITALES_ALERTA]: SignosVitalesAlertaPayload;
  [DomainEvents.PACIENTE_DADO_DE_ALTA]: PacienteDadoDeAltaPayload;
  [DomainEvents.CAMA_ASIGNADA]: CamaAsignadaPayload;
  [DomainEvents.CAMA_ESTADO_CAMBIADO]: CamaEstadoCambiadoPayload;
}
