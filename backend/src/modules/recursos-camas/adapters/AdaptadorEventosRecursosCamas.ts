import {
  BusEventosEnchufable,
  EVENTO_CAMBIO_ESTADO_CAMA,
  EVENTO_MEDICACION_ADMINISTRADA,
  EventoCambioEstadoCama,
  IPublicadorEstadoCama,
} from '../domain/IEventosRecursosCamas';

export class AdaptadorEventosRecursosCamas implements IPublicadorEstadoCama {
  private bus: BusEventosEnchufable | null = null;
  private consumidor: ((payload: unknown) => Promise<void>) | null = null;

  definirConsumidor(consumidor: (payload: unknown) => Promise<void>): void {
    this.consumidor = consumidor;
  }

  enchufar(bus: BusEventosEnchufable): void {
    this.bus = bus;
    bus.suscribir(EVENTO_MEDICACION_ADMINISTRADA, async (payload) => {
      if (!this.consumidor) return;
      await this.consumidor(payload);
    });
  }

  async publicarCambioEstado(evento: EventoCambioEstadoCama): Promise<void> {
    if (!this.bus) return;
    try {
      await this.bus.publicar(EVENTO_CAMBIO_ESTADO_CAMA, evento);
    } catch (error) {
      console.error('No se pudo publicar el cambio de estado de cama', error);
    }
  }
}