export const TIPOS_MOVIMIENTO = ['Descuento', 'Ingreso'] as const;

export type TipoMovimiento = (typeof TIPOS_MOVIMIENTO)[number];