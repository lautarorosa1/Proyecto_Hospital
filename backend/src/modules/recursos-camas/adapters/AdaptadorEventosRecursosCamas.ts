import type { IEventBus } from '../../../shared/domain/events/IEventBus';
import { DomainEvents } from '../../../shared/domain/events/DomainEvents';
import type {
  EventoAsignacionCama,
  EventoCambioEstadoCama,
  IPublicadorEstadoCama,
} from '../domain/IEventosRecursosCamas';

/** Traduce los eventos de Recursos y Camas al catálogo de eventos de dominio. */
export class AdaptadorEventosRecursosCamas implements IPublicadorEstadoCama {
  constructor(private readonly bus: IEventBus) {}

  async publicarCambioEstado(evento: EventoCambioEstadoCama): Promise<void> {
    try {
      this.bus.publish(DomainEvents.CAMA_ESTADO_CAMBIADO, {
        camaId: evento.cama_id,
        estadoAnterior: evento.estado_anterior,
        estadoNuevo: evento.estado_nuevo,
        usuarioId: evento.usuario_id,
        version: evento.version,
        timestamp: new Date(evento.fecha_cambio),
      });
    } catch (error) {
      console.error('No se pudo publicar el cambio de estado de cama', error);
    }
  }

  async publicarAsignacion(evento: EventoAsignacionCama): Promise<void> {
    try {
      this.bus.publish(DomainEvents.CAMA_ASIGNADA, {
        camaId: evento.cama_id,
        pacienteId: evento.paciente_id,
        usuarioId: evento.usuario_id,
        timestamp: new Date(evento.fecha_asignacion),
      });
    } catch (error) {
      console.error('No se pudo publicar la asignación de cama', error);
    }
  }
}
