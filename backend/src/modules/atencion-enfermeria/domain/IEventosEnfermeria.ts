import type {
  CamaAsignadaPayload,
  InternacionRegistradaPayload,
  MedicacionAdministradaPayload,
  PacienteDadoDeAltaPayload,
  SignosVitalesAlertaPayload,
  SignosVitalesRegistradoPayload,
} from '../../../shared/domain/events/DomainEvents';

/** Puerto de salida de Atención y Enfermería hacia el resto de los módulos. */
export interface IEventosEnfermeria {
  internacionRegistrada(payload: InternacionRegistradaPayload): void;
  medicacionAdministrada(payload: MedicacionAdministradaPayload): void;
  signosVitalesRegistrados(payload: SignosVitalesRegistradoPayload): void;
  signosVitalesAlerta(payload: SignosVitalesAlertaPayload): void;
  pacienteDadoDeAlta(payload: PacienteDadoDeAltaPayload): void;
}

/** Ubicación física del paciente (la resuelve Recursos y Camas). */
export interface IUbicacionInternacion {
  sectorDeCama(camaId: number): Promise<string | null>;
}

/** Alergias registradas en la Historia Clínica Electrónica. */
export interface IAlergiasPaciente {
  /** Devuelve el alérgeno coincidente con el medicamento, o null si no hay alergia. */
  alergiaA(pacienteId: number, medicamento: string): Promise<string | null>;
}

export type { CamaAsignadaPayload };
