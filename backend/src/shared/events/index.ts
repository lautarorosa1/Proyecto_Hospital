import { EventEmitterEventBus } from '../infrastructure/events/EventEmitterEventBus';

export const eventBus = EventEmitterEventBus.getInstance();

export * from '../domain/events/DomainEvents';
export * from '../domain/events/IEventBus';
export * from '../infrastructure/events/EventEmitterEventBus';
export * from './initSubscribers';

