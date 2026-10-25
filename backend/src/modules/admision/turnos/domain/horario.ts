// Helpers de fecha y hora. Fecha ("YYYY-MM-DD") y hora ("HH:mm") se manejan
// como texto en hora local de la clínica, así no hay desfases de zona horaria
// y los cálculos de duración (entreturno) se hacen en minutos.

const FECHA_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;
const HORA_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function esFechaValida(fecha: string): boolean {
  const match = FECHA_REGEX.exec(fecha);
  if (!match) return false;
  const [, anio, mes, dia] = match.map(Number);
  const date = new Date(Date.UTC(anio, mes - 1, dia));
  return (
    date.getUTCFullYear() === anio &&
    date.getUTCMonth() === mes - 1 &&
    date.getUTCDate() === dia
  );
}

export const NOMBRES_DIAS = [
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
  'domingo',
];

/** Día de la semana de una fecha "YYYY-MM-DD": 1 = lunes ... 7 = domingo. */
export function diaSemanaISO(fecha: string): number {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  const dow = new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay(); // 0 = domingo
  return dow === 0 ? 7 : dow;
}

export function esHoraValida(hora: string): boolean {
  return HORA_REGEX.test(hora);
}

export function horaAMinutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

export function minutosAHora(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function calcularHoraFin(horaInicio: string, duracionMin: number): string {
  return minutosAHora(horaAMinutos(horaInicio) + duracionMin);
}

export function ahoraLocal(): { fecha: string; hora: string } {
  const d = new Date();
  const dos = (n: number) => String(n).padStart(2, '0');
  return {
    fecha: `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`,
    hora: `${dos(d.getHours())}:${dos(d.getMinutes())}`,
  };
}

export function esPasado(fecha: string, hora: string): boolean {
  const ahora = ahoraLocal();
  return fecha < ahora.fecha || (fecha === ahora.fecha && hora < ahora.hora);
}
