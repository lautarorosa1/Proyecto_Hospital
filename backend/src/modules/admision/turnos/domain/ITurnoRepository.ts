import type { EstadoTurno, NuevoTurno, Turno } from './Turno';
import type { AjusteTurno, TurnoAjustado } from './Entreturno';

export interface FiltrosTurno {
  profesionalId?: number;
  pacienteId?: number;
  fecha?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  estado?: EstadoTurno;
  /** Si se indica, excluye los turnos que empiezan antes de este momento. */
  desde?: { fecha: string; hora: string };
}

export interface ITurnoRepository {
  findAll(filtros?: FiltrosTurno): Promise<Turno[]>;
  findById(id: number): Promise<Turno | null>;

  /** Turnos no cancelados de un profesional en una fecha (para detectar solapamientos). */
  findActivosByProfesionalYFecha(
    profesionalId: number,
    fecha: string,
  ): Promise<Turno[]>;

  create(data: NuevoTurno): Promise<Turno>;

  /**
   * Reserva el slot de forma atómica: solo se aplica si el turno sigue
   * "disponible" y su versión coincide con la indicada.
   * Devuelve false si alguien lo modificó antes (control de concurrencia).
   */
  reservar(id: number, version: number, pacienteId: number): Promise<boolean>;

  /**
   * Cambia el estado de forma atómica (compare-and-set): solo se aplica si el
   * turno sigue en `desde`. Devuelve false si otro usuario lo cambió antes.
   */
  cambiarEstado(
    id: number,
    desde: EstadoTurno,
    hacia: EstadoTurno,
  ): Promise<boolean>;

  /**
   * Cancela el turno (solo si sigue en `estadoEsperado`) y crea un slot nuevo
   * "disponible" en el mismo horario, todo en una transacción.
   * Devuelve null si el turno ya cambió de estado.
   */
  cancelarYLiberar(
    id: number,
    estadoEsperado: EstadoTurno,
  ): Promise<{ cancelado: Turno; liberado: Turno } | null>;

  /**
   * HU 1.2. Inserta un entreturno y recorta los turnos que se superponen,
   * todo en una única transacción:
   *  1. toma un lock por (profesional, fecha) para serializar entreturnos
   *     concurrentes del mismo día;
   *  2. lee los turnos activos YA con el lock tomado y le pide a `planificar`
   *     los recortes (si lanza un error, se hace rollback);
   *  3. inserta el entreturno (ID nuevo) y actualiza los turnos afectados
   *     conservando su ID.
   */
  insertarEntreturno(
    entreturno: NuevoTurno,
    planificar: (activos: Turno[]) => AjusteTurno[],
  ): Promise<{ entreturno: Turno; afectados: TurnoAjustado[] }>;
}
