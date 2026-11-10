import { EventEmitter } from 'events';
import { DomainEvents, EventPayloads } from '../../domain/events/DomainEvents';
import { EventHandler, IEventBus } from '../../domain/events/IEventBus';

export class EventEmitterEventBus implements IEventBus {
  private static instance: EventEmitterEventBus;
  private readonly emitter: EventEmitter;

  private constructor() {
    this.emitter = new EventEmitter();
  }

  public static getInstance(): EventEmitterEventBus {
    if (!EventEmitterEventBus.instance) {
      EventEmitterEventBus.instance = new EventEmitterEventBus();
    }
    return EventEmitterEventBus.instance;
  }

  public publish<K extends DomainEvents>(
    event: K,
    payload: EventPayloads[K],
  ): void {
    this.emitter.emit(event, payload);
  }

  public subscribe<K extends DomainEvents>(
    event: K,
    handler: EventHandler<K>,
  ): void {
    this.emitter.on(event, async (payload: EventPayloads[K]) => {
      try {
        await handler(payload);
      } catch (error) {
        console.error(`[EventBus] Error en suscriptor de ${event}:`, error);
      }
    });
  }
}

