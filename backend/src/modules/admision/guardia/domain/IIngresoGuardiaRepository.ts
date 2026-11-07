import type { IngresoGuardia, NuevoIngresoGuardia } from './IngresoGuardia';

export interface IIngresoGuardiaRepository {
  create(data: NuevoIngresoGuardia): Promise<IngresoGuardia>;
  findById(id: number): Promise<IngresoGuardia | null>;
  /** Ingreso del paciente que todavía está en espera o en atención. */
  findActivoByPaciente(pacienteId: number): Promise<IngresoGuardia | null>;
  /**
   * Cola de espera ya ordenada: menor prioridad numérica primero y, dentro del
   * mismo nivel, por orden de llegada.
   */
  findCola(): Promise<IngresoGuardia[]>;
}
