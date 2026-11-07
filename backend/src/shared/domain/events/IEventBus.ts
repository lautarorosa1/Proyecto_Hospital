import { DomainEvents, EventPayloads } from './DomainEvents';

export type EventHandler<K extends DomainEvents> = (
  payload: EventPayloads[K],
) => void | Promise<void>;

export interface IEventBus {
  publish<K extends DomainEvents>(
    event: K,
    payload: EventPayloads[K],
  ): void;

  subscribe<K extends DomainEvents>(
    event: K,
    handler: EventHandler<K>,
  ): void;
}

