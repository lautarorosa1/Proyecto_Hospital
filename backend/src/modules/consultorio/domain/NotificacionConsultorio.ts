export const TIPOS_NOTIFICACION = [
  'SALA_ESPERA',
  'ENTRETURNO',
  'TURNO_CANCELADO',
  'LISTA_ESPERA',
  'RIESGO_VITAL',
] as const;
export type TipoNotificacion = (typeof TIPOS_NOTIFICACION)[number];

/** Aviso persistente en la bandeja del profesional (queda aunque no esté conectado). */
export interface NotificacionConsultorio {
  id: number;
  profesionalId: number;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  /** Id del turno / ingreso que originó el aviso. */
  referenciaId?: number;
  leida: boolean;
  creadaEn: Date;
}

export type NuevaNotificacion = Omit<NotificacionConsultorio, 'id' | 'leida' | 'creadaEn'>;
