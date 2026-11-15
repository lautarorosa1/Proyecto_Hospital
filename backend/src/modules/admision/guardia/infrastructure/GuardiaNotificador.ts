import type { IEventBus } from '../../../../shared/domain/events/IEventBus';
import {
  DomainEvents,
  type AlertaRiesgoVitalPayload,
} from '../../../../shared/domain/events/DomainEvents';
import type { IngresoGuardia } from '../domain/IngresoGuardia';
import type { IGuardiaNotificador } from '../domain/IGuardiaNotificador';
import type { Paciente } from '../../pacientes/domain/Paciente';
import { etiquetaDe } from '../domain/NivelTriaje';

/** Alias histórico: el contrato vive ahora en el catálogo de eventos compartido. */
export type AlertaRiesgoVitalEvento = AlertaRiesgoVitalPayload;

/** Publica la alerta en el bus de eventos; los monitores se suscriben (ver AlertasGuardiaStream). */
export class GuardiaNotificador implements IGuardiaNotificador {
  constructor(private readonly bus: IEventBus) {}

  alertaRiesgoVital(
    ingreso: IngresoGuardia,
    paciente: Paciente,
    medicosIds: number[],
  ): void {
    const evento: AlertaRiesgoVitalPayload = {
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
    this.bus.publish(DomainEvents.ALERTA_RIESGO_VITAL, evento);
  }
}
