import type { EstadoTurno, Turno } from './Turno';
import { horaAMinutos, minutosAHora } from './horario';
import { ConflictError } from '../../../../shared/errors';

// HU 1.2 - Entreturno dinámico.
// Lógica pura (sin base de datos): dado el estado actual de la agenda del día,
// decide cómo se recortan los turnos que se pisan con el entreturno.

/** Duración por defecto de un entreturno si el cliente no indica otra. */
export const ENTRETURNO_DURACION_DEFAULT_MIN = 15;
export const ENTRETURNO_DURACION_MIN = 5;
export const ENTRETURNO_DURACION_MAX = 120;

/** Ningún turno puede quedar con menos tiempo que este después de un recorte. */
export const DURACION_MIN_TURNO_REDUCIDO = 10;

/** Solo estos estados admiten que se les recorte el horario. */
const ESTADOS_AJUSTABLES: readonly EstadoTurno[] = [
  'disponible',
  'programado',
  'confirmado',
];

/** Nuevo horario/duración que debe quedar en un turno existente. */
export interface AjusteTurno {
  /** El turno tal como estaba antes del recorte. */
  turno: Turno;
  horaInicio: string;
  duracionMin: number;
}

export interface TurnoAjustado {
  antes: Turno;
  despues: Turno;
}

const rango = (inicioMin: number, finMin: number) =>
  `${minutosAHora(inicioMin)}–${minutosAHora(finMin)}`;

/**
 * Calcula los recortes necesarios para que el entreturno
 * [horaInicio, horaInicio + duracionMin) entre sin superponerse con nadie.
 *
 *  - Turno que empieza antes del entreturno: se le acorta el final.
 *    (10:00–10:30 + entreturno 10:15–10:30  ->  10:00–10:15)
 *  - Turno que empieza dentro del entreturno y termina después: se le atrasa
 *    el inicio.  (10:30–11:00 + entreturno 10:15–10:45 -> 10:45–11:00)
 *
 * Se rechaza (409) si el entreturno partiría un turno en dos, si taparía un
 * turno completo, si el turno ya está en curso/atendido o si el turno
 * quedaría por debajo de DURACION_MIN_TURNO_REDUCIDO.
 *
 * @param activos turnos no cancelados del profesional en esa fecha
 */
export function planificarEntreturno(
  activos: Turno[],
  horaInicio: string,
  duracionMin: number,
): AjusteTurno[] {
  const inicio = horaAMinutos(horaInicio);
  const fin = inicio + duracionMin;
  const ajustes: AjusteTurno[] = [];

  for (const t of activos) {
    const tInicio = horaAMinutos(t.horaInicio);
    const tFin = tInicio + t.duracionMin;

    // Sin superposición (incluye turnos que apenas se tocan en el borde).
    if (tInicio >= fin || tFin <= inicio) continue;

    const turnoTxt = `turno de las ${rango(tInicio, tFin)}`;

    if (!ESTADOS_AJUSTABLES.includes(t.estado)) {
      throw new ConflictError(
        `El ${turnoTxt} está en estado "${t.estado}" y no se puede modificar para hacer lugar al entreturno`,
      );
    }

    let nuevoInicio: number;
    let nuevoFin: number;

    if (tInicio < inicio && tFin > fin) {
      throw new ConflictError(
        `El entreturno (${rango(inicio, fin)}) quedaría en el medio del ${turnoTxt} y lo partiría en dos. Indicá una duración que llegue hasta las ${minutosAHora(tFin)}`,
      );
    } else if (tInicio < inicio) {
      nuevoInicio = tInicio;
      nuevoFin = inicio;
    } else if (tFin > fin) {
      nuevoInicio = fin;
      nuevoFin = tFin;
    } else {
      throw new ConflictError(
        `El entreturno (${rango(inicio, fin)}) taparía por completo el ${turnoTxt}. Si el horario está libre, reservalo directamente`,
      );
    }

    const nuevaDuracion = nuevoFin - nuevoInicio;
    if (nuevaDuracion < DURACION_MIN_TURNO_REDUCIDO) {
      throw new ConflictError(
        `El ${turnoTxt} quedaría con ${nuevaDuracion} min (mínimo ${DURACION_MIN_TURNO_REDUCIDO} min). Elegí otro horario para el entreturno`,
      );
    }

    ajustes.push({
      turno: t,
      horaInicio: minutosAHora(nuevoInicio),
      duracionMin: nuevaDuracion,
    });
  }

  return ajustes;
}

/** Texto de advertencia para un turno recortado (lo muestra el front). */
export function advertenciaDeAjuste({ antes, despues }: TurnoAjustado): string {
  const base = `Turno de las ${antes.horaInicio}`;
  if (antes.horaInicio !== despues.horaInicio) {
    return `${base} se atrasó a las ${despues.horaInicio} y dura ${despues.duracionMin} min (antes ${antes.duracionMin} min) por un entreturno`;
  }
  return `${base}: duración reducida de ${antes.duracionMin} a ${despues.duracionMin} min por un entreturno`;
}
