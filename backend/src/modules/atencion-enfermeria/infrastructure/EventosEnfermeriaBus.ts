import type { IEventBus } from '../../../shared/domain/events/IEventBus';
import { DomainEvents } from '../../../shared/domain/events/DomainEvents';
import type { IEventosEnfermeria } from '../domain/IEventosEnfermeria';

/** Publica los hechos de enfermería en el bus de eventos de dominio. */
export class EventosEnfermeriaBus implements IEventosEnfermeria {
  constructor(private readonly bus: IEventBus) {}

  internacionRegistrada(p: Parameters<IEventosEnfermeria['internacionRegistrada']>[0]): void {
    this.bus.publish(DomainEvents.INTERNACION_REGISTRADA, p);
  }

  medicacionAdministrada(p: Parameters<IEventosEnfermeria['medicacionAdministrada']>[0]): void {
    this.bus.publish(DomainEvents.MEDICACION_ADMINISTRADA, p);
  }

  signosVitalesRegistrados(p: Parameters<IEventosEnfermeria['signosVitalesRegistrados']>[0]): void {
    this.bus.publish(DomainEvents.SIGNOS_VITALES_REGISTRADO, p);
  }

  signosVitalesAlerta(p: Parameters<IEventosEnfermeria['signosVitalesAlerta']>[0]): void {
    this.bus.publish(DomainEvents.SIGNOS_VITALES_ALERTA, p);
  }

  pacienteDadoDeAlta(p: Parameters<IEventosEnfermeria['pacienteDadoDeAlta']>[0]): void {
    this.bus.publish(DomainEvents.PACIENTE_DADO_DE_ALTA, p);
  }
}
