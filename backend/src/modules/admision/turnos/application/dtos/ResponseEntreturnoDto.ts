import type { ResponseTurnoDto } from './ResponseTurnoDto';

export interface ResponseEntreturnoDto {
  /** El entreturno recién creado (ID nuevo). */
  entreturno: ResponseTurnoDto;
  /** Turnos que se recortaron para hacerle lugar (mismos IDs que antes). */
  afectados: ResponseTurnoDto[];
  /** Mensajes listos para mostrarle al médico/recepción. */
  advertencias: string[];
}
