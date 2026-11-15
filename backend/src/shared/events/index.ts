import { EventEmitterEventBus } from '../infrastructure/events/EventEmitterEventBus';

// Instancia única del bus de eventos de toda la aplicación.
export const eventBus = EventEmitterEventBus.getInstance();

export * from '../domain/events/DomainEvents';
export * from '../domain/events/IEventBus';
export * from '../infrastructure/events/EventEmitterEventBus';
// initSubscribers NO se re-exporta acá: importa los módulos y generaría un ciclo.
