import type { OcupacionConsultorio } from './OcupacionConsultorio';

export interface IOcupacionRepository {
  /**
   * Abre la ocupación. Los índices únicos parciales de la base garantizan que,
   * aunque dos pedidos lleguen a la vez, solo uno gane (el otro lanza ConflictError).
   */
  abrir(habitacionId: number, profesionalId: number): Promise<OcupacionConsultorio>;

  findActivaByProfesional(profesionalId: number): Promise<OcupacionConsultorio | null>;
  findActivaByHabitacion(habitacionId: number): Promise<OcupacionConsultorio | null>;
  findActivas(): Promise<OcupacionConsultorio[]>;

  /** Cierra la ocupación activa; false si ya estaba cerrada. */
  finalizar(id: number): Promise<boolean>;
}
