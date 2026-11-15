import type { IEventBus } from '../../../../shared/domain/events/IEventBus';
import {
  DomainEvents,
  esTipoIngreso,
  type TipoIngreso,
} from '../../../../shared/domain/events/DomainEvents';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../../../../shared/errors';
import type { IPacienteRepository } from '../../pacientes/domain/IPacienteRepository';
import { ConfirmarIngresoDto } from './dtos/ConfirmarIngresoDto';
import { ResponseIngresoInternacionDto } from './dtos/ResponseIngresoInternacionDto';

const RESPIRATORIO = /neumon|respirator|bronquit|bronquiol/i;

/**
 * Admisión confirma el traslado de un paciente a internación / sala de
 * observación. No crea la internación: publica PACIENTE_INGRESADO y el módulo
 * de Atención y Enfermería reacciona (crea la internación y arma el protocolo
 * de cuidados con el Builder que corresponda al tipo de ingreso).
 */
export class IngresoInternacionService {
  constructor(
    private readonly pacienteRepository: IPacienteRepository,
    private readonly bus: IEventBus,
  ) {}

  private resolverTipo(dto: ConfirmarIngresoDto): TipoIngreso {
    if (dto.tipoIngreso !== undefined) {
      if (!esTipoIngreso(dto.tipoIngreso)) {
        throw new BadRequestError(
          'tipoIngreso debe ser CIRUGIA_PROGRAMADA, INFECCION_RESPIRATORIA o GENERAL',
        );
      }
      return dto.tipoIngreso;
    }
    if (dto.diagnosticoInicial && RESPIRATORIO.test(dto.diagnosticoInicial)) {
      return 'INFECCION_RESPIRATORIA';
    }
    return 'GENERAL';
  }

  async confirmarIngreso(
    dto: ConfirmarIngresoDto,
  ): Promise<ResponseIngresoInternacionDto> {
    if (!dto || typeof dto !== 'object') {
      throw new BadRequestError('Debe proporcionar los datos del ingreso');
    }
    if (!Number.isInteger(dto.pacienteId) || dto.pacienteId <= 0) {
      throw new BadRequestError('pacienteId debe ser un entero positivo');
    }
    if (typeof dto.motivoIngreso !== 'string' || !dto.motivoIngreso.trim()) {
      throw new BadRequestError('El motivo de ingreso es obligatorio');
    }
    if (
      dto.usuarioId !== undefined &&
      (!Number.isInteger(dto.usuarioId) || dto.usuarioId <= 0)
    ) {
      throw new BadRequestError('usuarioId debe ser un entero positivo');
    }
    const tipoIngreso = this.resolverTipo(dto);

    const paciente = await this.pacienteRepository.findById(dto.pacienteId);
    if (!paciente) throw new NotFoundError('Paciente not found');
    if (!paciente.activo) throw new ConflictError('El paciente está dado de baja');

    const ahora = new Date();
    const motivoIngreso = dto.motivoIngreso.trim();
    this.bus.publish(DomainEvents.PACIENTE_INGRESADO, {
      pacienteId: paciente.id,
      tipoIngreso,
      motivoIngreso,
      diagnosticoInicial: dto.diagnosticoInicial?.trim() || undefined,
      usuarioId: dto.usuarioId,
      timestamp: ahora,
    });

    return {
      pacienteId: paciente.id,
      tipoIngreso,
      motivoIngreso,
      estado: 'ingreso_confirmado',
      confirmadoEn: ahora.toISOString(),
    };
  }
}
