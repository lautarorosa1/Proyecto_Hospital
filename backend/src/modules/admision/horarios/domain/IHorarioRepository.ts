import type { HorarioProfesional, NuevoHorario } from './HorarioProfesional';

export interface IHorarioRepository {
  /** Agenda semanal completa del profesional, ordenada por día y hora. */
  findByProfesional(profesionalId: number): Promise<HorarioProfesional[]>;

  /** Rangos de un día de la semana (1 = lunes ... 7 = domingo), ordenados por hora. */
  findByProfesionalYDia(
    profesionalId: number,
    diaSemana: number,
  ): Promise<HorarioProfesional[]>;

  /** Reemplaza toda la agenda semanal del profesional (en una transacción). */
  reemplazar(
    profesionalId: number,
    horarios: NuevoHorario[],
  ): Promise<HorarioProfesional[]>;
}
