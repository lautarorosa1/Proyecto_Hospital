import { BadRequestError, ConflictError, NotFoundError } from '../../../shared/errors';
import type { ITurnoService } from '../../admision/turnos/application/ITurnoService';
import type { ResponseTurnoDto } from '../../admision/turnos/application/dtos/ResponseTurnoDto';
import type { IPacienteRepository } from '../../admision/pacientes/domain/IPacienteRepository';
import type { IProfesionalRepository } from '../../admision/profesionales/domain/IProfesionalRepository';
import { ahoraLocal } from '../../admision/turnos/domain/horario';
import type { IOcupacionRepository } from '../domain/IOcupacionRepository';
import type {
  AgendaConsultorioDto,
  PacienteResumenDto,
  TurnoConsultorioDto,
} from './dtos/ConsultorioDtos';

/** Vista del profesional sobre sus turnos: agenda del día, sala de espera y atención. */
export class AgendaConsultorioService {
  constructor(
    private readonly turnos: ITurnoService,
    private readonly pacientes: IPacienteRepository,
    private readonly profesionales: IProfesionalRepository,
    private readonly ocupaciones: IOcupacionRepository,
  ) {}

  private async exigirProfesional(profesionalId: number): Promise<void> {
    if (!Number.isInteger(profesionalId) || profesionalId <= 0) {
      throw new BadRequestError('profesionalId debe ser un entero positivo');
    }
    const profesional = await this.profesionales.findById(profesionalId);
    if (!profesional) throw new NotFoundError('Profesional not found');
  }

  private resolverFecha(fecha?: string): string {
    if (fecha === undefined) return ahoraLocal().fecha;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      throw new BadRequestError('La fecha debe tener formato YYYY-MM-DD');
    }
    return fecha;
  }

  private async conPaciente(turnos: ResponseTurnoDto[]): Promise<TurnoConsultorioDto[]> {
    const ids = [...new Set(turnos.map((t) => t.pacienteId).filter((id): id is number => !!id))];
    const resumenes = new Map<number, PacienteResumenDto>();
    await Promise.all(
      ids.map(async (id) => {
        const p = await this.pacientes.findById(id);
        if (p) resumenes.set(id, { id: p.id, nombre: p.nombre, apellido: p.apellido, dni: p.dni });
      }),
    );
    return turnos.map((t) => ({
      ...t,
      paciente: t.pacienteId ? resumenes.get(t.pacienteId) : undefined,
    }));
  }

  /** Turnos del día del profesional (sin los horarios todavía libres). */
  async agenda(profesionalId: number, fecha?: string): Promise<AgendaConsultorioDto> {
    await this.exigirProfesional(profesionalId);
    const dia = this.resolverFecha(fecha);

    const todos = await this.turnos.getAll({ profesionalId, fecha: dia });
    const reservados = todos
      .filter((t) => t.estado !== 'disponible')
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

    const resumen = { programado: 0, confirmado: 0, en_sala_espera: 0, atendido: 0, cancelado: 0 };
    for (const t of reservados) {
      if (t.estado in resumen) resumen[t.estado as keyof typeof resumen]++;
    }

    return {
      fecha: dia,
      profesionalId,
      turnos: await this.conPaciente(reservados),
      resumen,
    };
  }

  /** Pacientes que ya llegaron y esperan ser atendidos, en orden de horario. */
  async salaEspera(profesionalId: number, fecha?: string): Promise<TurnoConsultorioDto[]> {
    const { turnos } = await this.agenda(profesionalId, fecha);
    return turnos.filter((t) => t.estado === 'en_sala_espera');
  }

  /**
   * Marca el turno como atendido. Reglas: el turno debe ser del profesional y el
   * profesional debe tener un consultorio abierto (la atención ocupa una sala).
   * Las transiciones válidas del turno las resuelve el patrón State de Admisión.
   */
  async atender(profesionalId: number, turnoId: number): Promise<TurnoConsultorioDto> {
    await this.exigirProfesional(profesionalId);
    if (!Number.isInteger(turnoId) || turnoId <= 0) {
      throw new BadRequestError('turnoId debe ser un entero positivo');
    }

    const turno = await this.turnos.getById(turnoId);
    if (turno.profesionalId !== profesionalId) {
      throw new ConflictError('El turno no pertenece a este profesional');
    }

    const ocupacion = await this.ocupaciones.findActivaByProfesional(profesionalId);
    if (!ocupacion) {
      throw new ConflictError('Abrí un consultorio antes de atender pacientes');
    }

    const atendido = await this.turnos.atender(turnoId);
    return (await this.conPaciente([atendido]))[0];
  }
}
