import type { EsperaTurno, NuevaEspera } from './ListaEspera';

export interface IListaEsperaRepository {
  crear(data: NuevaEspera): Promise<EsperaTurno>;

  /** Entradas en espera de un profesional y fecha, en orden de la cola. */
  findEnEspera(profesionalId: number, fecha: string): Promise<EsperaTurno[]>;

  findAllEnEspera(filtros: {
    profesionalId?: number;
    fecha?: string;
  }): Promise<EsperaTurno[]>;

  /**
   * Desencola de forma atómica al primero en espera (lo marca "asignado").
   * Dos cancelaciones simultáneas nunca reciben al mismo paciente.
   */
  reclamarPrimero(
    profesionalId: number,
    fecha: string,
  ): Promise<EsperaTurno | null>;

  /** Vincula la entrada reclamada con el turno que se le asignó. */
  registrarTurno(id: number, turnoId: number): Promise<void>;

  /** Devuelve una entrada reclamada a la cola (si no se pudo asignar el horario). */
  devolver(id: number): Promise<void>;

  /** Saca de la cola a una entrada que ya no puede recibir turno. */
  descartar(id: number): Promise<void>;
}
