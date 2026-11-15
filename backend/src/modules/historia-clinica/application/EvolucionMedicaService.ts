import type { EvolucionMedica } from '../domain/EvolucionMedica';
import type {
  IEvolucionMedicaRepository,
  CamposEditablesEvolucion
} from '../domain/IEvolucionMedicaRepository';
import type { IPacienteRepository } from '../../admision/pacientes/domain/IPacienteRepository';
import { BadRequestError, NotFoundError } from '../../../shared/errors';

type DatosEvolucion = {
  pacienteId: number;
  fecha: string;
  motivoConsulta: string;
  observaciones: string;
  indicaciones?: string | null;
};

export class EvolucionMedicaService {
  constructor(
    private readonly evolucionRepository: IEvolucionMedicaRepository,
    private readonly pacienteRepository: IPacienteRepository
  ) {}

  async obtenerPorPaciente(pacienteId: number): Promise<EvolucionMedica[]> {
    this.validarId(pacienteId);
    return this.evolucionRepository.findByPacienteId(pacienteId);
  }

  async obtenerPorId(id: number): Promise<EvolucionMedica> {
    this.validarId(id);

    const evolucion = await this.evolucionRepository.findById(id);

    if (!evolucion) {
      throw new NotFoundError('Evolución médica no encontrada');
    }

    return evolucion;
  }

  async registrar(data: DatosEvolucion): Promise<EvolucionMedica> {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new BadRequestError(
        'Debe proporcionar los datos de la evolución médica'
      );
    }

    this.validarId(data.pacienteId);
    this.validarCampos(data, true);

    const paciente = await this.pacienteRepository.findById(data.pacienteId);

    if (!paciente) {
      throw new NotFoundError('Paciente no encontrado');
    }

    return this.evolucionRepository.create({
      pacienteId: data.pacienteId,
      fecha: data.fecha,
      motivoConsulta: data.motivoConsulta.trim(),
      observaciones: data.observaciones.trim(),
      indicaciones: data.indicaciones?.trim() || null
    });
  }

  async actualizar(
    id: number,
    data: CamposEditablesEvolucion
  ): Promise<EvolucionMedica> {
    this.validarId(id);

    if (
      !data ||
      typeof data !== 'object' ||
      Array.isArray(data) ||
      Object.keys(data).length === 0
    ) {
      throw new BadRequestError('Debe proporcionar campos para actualizar');
    }

    this.validarCampos(data, false);

    const evolucion = await this.evolucionRepository.update(id, {
      ...(data.fecha !== undefined && { fecha: data.fecha }),
      ...(data.motivoConsulta !== undefined && {
        motivoConsulta: data.motivoConsulta.trim()
      }),
      ...(data.observaciones !== undefined && {
        observaciones: data.observaciones.trim()
      }),
      ...(data.indicaciones !== undefined && {
        indicaciones: data.indicaciones?.trim() || null
      })
    });

    if (!evolucion) {
      throw new NotFoundError('Evolución médica no encontrada');
    }

    return evolucion;
  }

  async eliminar(id: number): Promise<void> {
    this.validarId(id);

    const eliminada = await this.evolucionRepository.delete(id);

    if (!eliminada) {
      throw new NotFoundError('Evolución médica no encontrada');
    }
  }

  private validarId(id: number): void {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new BadRequestError('El id debe ser un entero positivo');
    }
  }

  private fechaValida(fecha: unknown): boolean {
    if (typeof fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return false;
    }

    const d = new Date(`${fecha}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === fecha;
  }
  private fechaDeHoy(): string {
  // 'en-CA' formatea como AAAA-MM-DD
  return new Date().toLocaleDateString('en-CA', {
    timeZone: 'America/Argentina/Buenos_Aires'
  });
}

  private validarCampos(
    data: CamposEditablesEvolucion & { pacienteId?: number },
    obligatorio: boolean
  ): void {
    const camposPermitidos = [
      'fecha',
      'motivoConsulta',
      'observaciones',
      'indicaciones',
      'pacienteId'
    ];

    for (const campo of Object.keys(data)) {
      if (!camposPermitidos.includes(campo)) {
        throw new BadRequestError(`Campo no permitido: ${campo}`);
      }
    }

    if (
      obligatorio &&
      (data.fecha === undefined ||
        data.motivoConsulta === undefined ||
        data.observaciones === undefined)
    ) {
      throw new BadRequestError(
        'Fecha, motivo de consulta y observaciones son obligatorios'
      );
    }

    if (data.fecha !== undefined) {
  if (!this.fechaValida(data.fecha)) {
    throw new BadRequestError('La fecha debe tener formato AAAA-MM-DD');
  }

  if (data.fecha > this.fechaDeHoy()) {
    throw new BadRequestError(
      'La fecha de la evolución no puede ser posterior a hoy'
    );
  }
}

    if (data.motivoConsulta !== undefined) {
      if (
        typeof data.motivoConsulta !== 'string' ||
        !data.motivoConsulta.trim() ||
        data.motivoConsulta.trim().length > 200
      ) {
        throw new BadRequestError(
          'El motivo de consulta debe tener entre 1 y 200 caracteres'
        );
      }
    }

    if (data.observaciones !== undefined) {
      if (
        typeof data.observaciones !== 'string' ||
        !data.observaciones.trim() ||
        data.observaciones.trim().length > 2000
      ) {
        throw new BadRequestError(
          'Las observaciones deben tener entre 1 y 2000 caracteres'
        );
      }
    }

    if (data.indicaciones !== undefined && data.indicaciones !== null) {
      if (
        typeof data.indicaciones !== 'string' ||
        data.indicaciones.trim().length > 2000
      ) {
        throw new BadRequestError(
          'Las indicaciones no pueden superar los 2000 caracteres'
        );
      }
    }
  }
}