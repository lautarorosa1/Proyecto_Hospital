// Niveles de triaje de guardia. La prioridad es numérica: 1 es la más urgente.
// "rojo" es Riesgo Vital (HU 3.1): entra primero en la cola y dispara la alerta.
export const NIVELES_TRIAJE = [
  'rojo',
  'naranja',
  'amarillo',
  'verde',
  'azul',
] as const;

export type NivelTriaje = (typeof NIVELES_TRIAJE)[number];

export const INFO_NIVEL_TRIAJE: Record<
  NivelTriaje,
  { prioridad: number; etiqueta: string }
> = {
  rojo: { prioridad: 1, etiqueta: 'Riesgo Vital' },
  naranja: { prioridad: 2, etiqueta: 'Emergencia' },
  amarillo: { prioridad: 3, etiqueta: 'Urgencia' },
  verde: { prioridad: 4, etiqueta: 'Urgencia menor' },
  azul: { prioridad: 5, etiqueta: 'No urgente' },
};

export function esNivelTriaje(valor: unknown): valor is NivelTriaje {
  return (
    typeof valor === 'string' &&
    (NIVELES_TRIAJE as readonly string[]).includes(valor)
  );
}

export const prioridadDe = (nivel: NivelTriaje): number =>
  INFO_NIVEL_TRIAJE[nivel].prioridad;

export const etiquetaDe = (nivel: NivelTriaje): string =>
  INFO_NIVEL_TRIAJE[nivel].etiqueta;
