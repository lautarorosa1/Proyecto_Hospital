import type { EstudioMedico } from '../domain/EstudioMedico';
import type {
  IEstudioMedicoRepository,
  CamposEditablesEstudio
} from '../domain/IEstudioMedicoRepository';
import type { IPacienteRepository } from '../../admision/pacientes/domain/IPacienteRepository';
import { BadRequestError, NotFoundError } from '../../../shared/errors';

type DatosEstudio = {
  pacienteId: number;
  fecha: string;
  tipoEstudio: string;
  descripcion: string;
  resultado?: string | null;
};

export class EstudioMedicoService {
  constructor(
    private readonly estudioRepository: IEstudioMedicoRepository,
    private readonly pacienteRepository: IPacienteRepository
  ) {}

  async obtenerPorPaciente(pacienteId: number): Promise<EstudioMedico[]> {
    this.validarId(pacienteId);
    return this.estudioRepository.findByPacienteId(pacienteId);
  }

  async obtenerPorId(id: number): Promise<EstudioMedico> {
    this.validarId(id);

    const estudio = await this.estudioRepository.findById(id);

    if (!estudio) {
      throw new NotFoundError('Estudio médico no encontrado');
    }

    return estudio;
  }

  async registrar(data: DatosEstudio): Promise<EstudioMedico> {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new BadRequestError(
        'Debe proporcionar los datos del estudio médico'
      );
    }

    this.validarId(data.pacienteId);
    this.validarCampos(data, true);

    const paciente = await this.pacienteRepository.findById(data.pacienteId);

    if (!paciente) {
      throw new NotFoundError('Paciente no encontrado');
    }

    return this.estudioRepository.create({
      pacienteId: data.pacienteId,
      fecha: data.fecha,
      tipoEstudio: data.tipoEstudio.trim(),
      descripcion: data.descripcion.trim(),
      resultado: data.resultado?.trim() || null
    });
  }

  async actualizar(
    id: number,
    data: CamposEditablesEstudio
  ): Promise<EstudioMedico> {
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

    const estudio = await this.estudioRepository.update(id, {
      ...(data.fecha !== undefined && { fecha: data.fecha }),
      ...(data.tipoEstudio !== undefined && {
        tipoEstudio: data.tipoEstudio.trim()
      }),
      ...(data.descripcion !== undefined && {
        descripcion: data.descripcion.trim()
      }),
      ...(data.resultado !== undefined && {
        resultado: data.resultado?.trim() || null
      })
    });

    if (!estudio) {
      throw new NotFoundError('Estudio médico no encontrado');
    }

    return estudio;
  }

  async eliminar(id: number): Promise<void> {
    this.validarId(id);

    const eliminado = await this.estudioRepository.delete(id);

    if (!eliminado) {
      throw new NotFoundError('Estudio médico no encontrado');
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
    return new Date().toLocaleDateString('en-CA', {
      timeZone: 'America/Argentina/Buenos_Aires'
    });
  }

  private validarCampos(
    data: CamposEditablesEstudio & { pacienteId?: number },
    obligatorio: boolean
  ): void {
    const camposPermitidos = [
      'fecha',
      'tipoEstudio',
      'descripcion',
      'resultado',
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
        data.tipoEstudio === undefined ||
        data.descripcion === undefined)
    ) {
      throw new BadRequestError(
        'Fecha, tipo de estudio y descripción son obligatorios'
      );
    }

    if (data.fecha !== undefined) {
      if (!this.fechaValida(data.fecha)) {
        throw new BadRequestError('La fecha debe tener formato AAAA-MM-DD');
      }

      if (data.fecha > this.fechaDeHoy()) {
        throw new BadRequestError(
          'La fecha del estudio no puede ser posterior a hoy'
        );
      }
    }

    if (data.tipoEstudio !== undefined) {
      if (
        typeof data.tipoEstudio !== 'string' ||
        !data.tipoEstudio.trim() ||
        data.tipoEstudio.trim().length > 150
      ) {
        throw new BadRequestError(
          'El tipo de estudio debe tener entre 1 y 150 caracteres'
        );
      }
    }

    if (data.descripcion !== undefined) {
      if (
        typeof data.descripcion !== 'string' ||
        !data.descripcion.trim() ||
        data.descripcion.trim().length > 2000
      ) {
        throw new BadRequestError(
          'La descripción debe tener entre 1 y 2000 caracteres'
        );
      }
    }

    if (data.resultado !== undefined && data.resultado !== null) {
      if (
        typeof data.resultado !== 'string' ||
        data.resultado.trim().length > 2000
      ) {
        throw new BadRequestError(
          'El resultado no puede superar los 2000 caracteres'
        );
      }
    }
  }
}