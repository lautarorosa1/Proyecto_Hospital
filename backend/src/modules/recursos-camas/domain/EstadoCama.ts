export const ESTADOS_CAMA = ['Libre', 'Ocupada', 'En limpieza', 'Bloqueada'] as const;

export type EstadoCama = (typeof ESTADOS_CAMA)[number];

const TRANSICIONES: Record<EstadoCama, readonly EstadoCama[]> = {
  Libre: ['Ocupada', 'Bloqueada'],
  Ocupada: ['En limpieza'],
  'En limpieza': ['Libre'],
  Bloqueada: ['Libre'],
};

export function esEstadoCama(valor: string): valor is EstadoCama {
  return (ESTADOS_CAMA as readonly string[]).includes(valor);
}

export function transicionPermitida(desde: EstadoCama, hacia: EstadoCama): boolean {
  return TRANSICIONES[desde].includes(hacia);
}

/** Libre → Ocupada queda reservada a la asignación. */
export function transicionDirectaPermitida(desde: EstadoCama, hacia: EstadoCama): boolean {
  return transicionPermitida(desde, hacia) && hacia !== 'Ocupada';
}