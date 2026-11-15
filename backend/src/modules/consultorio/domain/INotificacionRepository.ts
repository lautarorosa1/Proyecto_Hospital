import type {
  NotificacionConsultorio,
  NuevaNotificacion,
} from './NotificacionConsultorio';

export interface INotificacionRepository {
  crear(data: NuevaNotificacion): Promise<NotificacionConsultorio>;

  /** Más recientes primero. */
  listar(
    profesionalId: number,
    opciones: { soloNoLeidas?: boolean; limite?: number },
  ): Promise<NotificacionConsultorio[]>;

  contarNoLeidas(profesionalId: number): Promise<number>;

  /** Marca una notificación del profesional; false si no existe o es de otro profesional. */
  marcarLeida(id: number, profesionalId: number): Promise<boolean>;

  /** Devuelve cuántas se marcaron. */
  marcarTodasLeidas(profesionalId: number): Promise<number>;
}
