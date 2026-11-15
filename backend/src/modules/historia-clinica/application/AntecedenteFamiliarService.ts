import type { AntecedenteFamiliar } from '../domain/AntecedenteFamiliar';
import type { IAntecedenteFamiliarRepository } from '../domain/IAntecedenteFamiliarRepository';
import type { IPacienteRepository } from '../../admision/pacientes/domain/IPacienteRepository';
import { BadRequestError, NotFoundError } from '../../../shared/errors';

type DatosAntecedente = {
  pacienteId: number;
  parentesco: string;
  enfermedad: string;
  observaciones?: string | null;
};

type ActualizarAntecedente = Partial<
  Pick<AntecedenteFamiliar, 'parentesco' | 'enfermedad' | 'observaciones'>
>;

export class AntecedenteFamiliarService {
  constructor(
    private readonly antecedenteRepository: IAntecedenteFamiliarRepository,
    private readonly pacienteRepository: IPacienteRepository
  ) {}

  async obtenerPorPaciente(pacienteId: number): Promise<AntecedenteFamiliar[]> {
    this.validarId(pacienteId);
    return this.antecedenteRepository.findByPacienteId(pacienteId);
  }

  async obtenerPorId(id: number): Promise<AntecedenteFamiliar> {
    this.validarId(id);

    const antecedente = await this.antecedenteRepository.findById(id);

    if (!antecedente) {
      throw new NotFoundError('Antecedente familiar no encontrado');
    }

    return antecedente;
  }

  async registrar(data: DatosAntecedente): Promise<AntecedenteFamiliar> {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new BadRequestError(
        'Debe proporcionar los datos del antecedente familiar'
      );
    }

    this.validarId(data.pacienteId);
    this.validarCampos(data, true);

    const paciente = await this.pacienteRepository.findById(data.pacienteId);

    if (!paciente) {
      throw new NotFoundError('Paciente no encontrado');
    }

    return this.antecedenteRepository.create({
      pacienteId: data.pacienteId,
      parentesco: data.parentesco.trim(),
      enfermedad: data.enfermedad.trim(),
      observaciones: data.observaciones?.trim() || null
    });
  }

  async actualizar(
    id: number,
    data: ActualizarAntecedente
  ): Promise<AntecedenteFamiliar> {
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

    const antecedente = await this.antecedenteRepository.update(id, {
      ...(data.parentesco !== undefined && {
        parentesco: data.parentesco.trim()
      }),
      ...(data.enfermedad !== undefined && {
        enfermedad: data.enfermedad.trim()
      }),
      ...(data.observaciones !== undefined && {
        observaciones: data.observaciones?.trim() || null
      })
    });

    if (!antecedente) {
      throw new NotFoundError('Antecedente familiar no encontrado');
    }

    return antecedente;
  }

  async eliminar(id: number): Promise<void> {
    this.validarId(id);

    const eliminado = await this.antecedenteRepository.delete(id);

    if (!eliminado) {
      throw new NotFoundError('Antecedente familiar no encontrado');
    }
  }

  private validarId(id: number): void {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new BadRequestError('El id debe ser un entero positivo');
    }
  }

  private validarCampos(
    data: ActualizarAntecedente & { pacienteId?: number },
    obligatorio: boolean
  ): void {
    const camposPermitidos = [
      'parentesco',
      'enfermedad',
      'observaciones',
      'pacienteId'
    ];

    for (const campo of Object.keys(data)) {
      if (!camposPermitidos.includes(campo)) {
        throw new BadRequestError(`Campo no permitido: ${campo}`);
      }
    }

    if (
      obligatorio &&
      (data.parentesco === undefined || data.enfermedad === undefined)
    ) {
      throw new BadRequestError('Parentesco y enfermedad son obligatorios');
    }

    if (data.parentesco !== undefined) {
      if (
        typeof data.parentesco !== 'string' ||
        !data.parentesco.trim() ||
        data.parentesco.trim().length > 50
      ) {
        throw new BadRequestError(
          'El parentesco debe tener entre 1 y 50 caracteres'
        );
      }
    }

    if (data.enfermedad !== undefined) {
      if (
        typeof data.enfermedad !== 'string' ||
        !data.enfermedad.trim() ||
        data.enfermedad.trim().length > 150
      ) {
        throw new BadRequestError(
          'La enfermedad debe tener entre 1 y 150 caracteres'
        );
      }
    }

    if (data.observaciones !== undefined && data.observaciones !== null) {
      if (
        typeof data.observaciones !== 'string' ||
        data.observaciones.trim().length > 500
      ) {
        throw new BadRequestError(
          'Las observaciones no pueden superar los 500 caracteres'
        );
      }
    }
  }
}