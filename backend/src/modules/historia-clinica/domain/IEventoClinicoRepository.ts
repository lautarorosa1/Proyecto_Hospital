import type { EventoClinico, NuevoEventoClinico } from './EventoClinico';

export interface IEventoClinicoRepository {
  create(data: NuevoEventoClinico): Promise<EventoClinico>;

  /** Eventos del paciente, del más reciente al más antiguo. */
  findByPacienteId(pacienteId: number): Promise<EventoClinico[]>;
}
