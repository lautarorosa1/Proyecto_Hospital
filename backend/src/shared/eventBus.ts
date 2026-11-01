import { EventEmitter } from 'node:events';

// Bus de eventos en memoria para desacoplar módulos (Observer).
// Admisión publica; otros módulos (consultorio, historia clínica, etc.) se suscriben.
export const eventBus = new EventEmitter();
