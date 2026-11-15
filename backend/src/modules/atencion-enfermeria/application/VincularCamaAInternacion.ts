import type { Internacion } from '../domain/Internaciones';
import type { IInternacionRepository } from '../domain/InternacionRepository';

/**
 * Reacciona a CAMA_ASIGNADA (Recursos y Camas): guarda la cama en la
 * internación activa del paciente para poder ubicarlo y liberar la cama al alta.
 */
export class VincularCamaAInternacion {
  constructor(private readonly repositorio: IInternacionRepository) {}

  async ejecutar(pacienteId: number, camaId: number): Promise<Internacion | null> {
    const internaciones = await this.repositorio.findByPacienteId(pacienteId);
    const activa = internaciones
      .filter((item) => item.estado === 'ACTIVA')
      .sort((a, b) => b.id - a.id)[0];

    if (!activa) {
      console.warn(
        `[Enfermería] Cama ${camaId} asignada al paciente ${pacienteId} sin internación activa`
      );
      return null;
    }

    return await this.repositorio.update(activa.id, { camaId });
  }
}
