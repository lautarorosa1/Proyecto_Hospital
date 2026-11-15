import type { EventoClinico, NuevoEventoClinico } from '../domain/EventoClinico';
import type { IEventoClinicoRepository } from '../domain/IEventoClinicoRepository';
import type { IPacienteRepository } from '../../admision/pacientes/domain/IPacienteRepository';
import { BadRequestError, NotFoundError } from '../../../shared/errors';

/**
 * La Historia Clínica es el registro centralizado del paciente: recibe los
 * hechos clínicos que publican Admisión y Enfermería y los ordena en una línea
 * de tiempo consultable.
 */
export class EventoClinicoService {
  constructor(
    private readonly repository: IEventoClinicoRepository,
    private readonly pacienteRepository: IPacienteRepository
  ) {}

  async registrar(data: NuevoEventoClinico): Promise<EventoClinico> {
    return this.repository.create(data);
  }

  async obtenerLineaDeTiempo(pacienteId: number): Promise<EventoClinico[]> {
    if (!Number.isInteger(pacienteId) || pacienteId <= 0) {
      throw new BadRequestError('El id del paciente debe ser un entero positivo');
    }
    const paciente = await this.pacienteRepository.findById(pacienteId);
    if (!paciente) throw new NotFoundError('Paciente not found');
    return this.repository.findByPacienteId(pacienteId);
  }
}
