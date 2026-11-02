import type { EventEmitter } from 'node:events';
import type { IngresoGuardia } from '../domain/IngresoGuardia';
import type { IGuardiaNotificador } from '../domain/IGuardiaNotificador';
import type { Paciente } from '../../pacientes/domain/Paciente';
import { etiquetaDe } from '../domain/NivelTriaje';

export const EVENTO_ALERTA_RIESGO_VITAL = 'guardia.alerta_riesgo_vital';

export interface AlertaRiesgoVitalEvento {
  tipo: 'ALERTA_RIESGO_VITAL';
  /** El monitor la muestra destacada (pantalla completa / sonido). */
  severidad: 'critica';
  ingresoId: number;
  pacienteId: number;
  pacienteNombre: string;
  nivelTriaje: string;
  etiquetaNivel: string;
  motivoConsulta: string;
  ingresadoEn: string; // ISO
  /** Médicos de guardia disponibles a los que va dirigida la alerta. */
  medicosDestinatarios: number[];
}

/** Publica la alerta en el bus interno; los monitores se suscriben (ver AlertasGuardiaStream). */
export class GuardiaNotificador implements IGuardiaNotificador {
  constructor(private readonly bus: EventEmitter) {}

  alertaRiesgoVital(
    ingreso: IngresoGuardia,
    paciente: Paciente,
    medicosIds: number[],
  ): void {
    const evento: AlertaRiesgoVitalEvento = {
      tipo: 'ALERTA_RIESGO_VITAL',
      severidad: 'critica',
      ingresoId: ingreso.id,
      pacienteId: ingreso.pacienteId,
      pacienteNombre: `${paciente.apellido}, ${paciente.nombre}`,
      nivelTriaje: ingreso.nivelTriaje,
      etiquetaNivel: etiquetaDe(ingreso.nivelTriaje),
      motivoConsulta: ingreso.motivoConsulta,
      ingresadoEn: ingreso.ingresadoEn.toISOString(),
      medicosDestinatarios: medicosIds,
    };
    this.bus.emit(EVENTO_ALERTA_RIESGO_VITAL, evento);
  }
}
