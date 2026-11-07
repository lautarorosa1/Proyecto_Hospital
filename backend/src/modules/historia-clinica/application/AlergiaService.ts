import type { Alergia } from '../domain/Alergia';
import type { IAlergiaRepository } from '../domain/IAlergiaRepository';
import type { IPacienteRepository } from '../../admision/pacientes/domain/IPacienteRepository';
import { BadRequestError, NotFoundError } from '../../../shared/errors';

type DatosAlergia = Omit<Alergia, 'id' | 'fechaRegistro'>;

type ActualizarAlergia = Partial<
  Pick<Alergia, 'alergeno' | 'reaccion' | 'severidad'>
>;

export class AlergiaService {
 constructor(
  private readonly alergiaRepository: IAlergiaRepository,
  private readonly pacienteRepository: IPacienteRepository
) {}

  async obtenerPorPaciente(pacienteId: number): Promise<Alergia[]> {
    this.validarId(pacienteId);

    return this.alergiaRepository.findByPacienteId(pacienteId);
  }

  async obtenerPorId(id: number): Promise<Alergia> {
    this.validarId(id);

    const alergia = await this.alergiaRepository.findById(id);

    if (!alergia) {
      throw new NotFoundError('Alergia no encontrada');
    }

    return alergia;
  }

  async registrar(data: DatosAlergia): Promise<Alergia> {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new BadRequestError('Debe proporcionar los datos de la alergia');
    }

    this.validarId(data.pacienteId);
    this.validarCampos(data, true);
    const paciente = await this.pacienteRepository.findById(data.pacienteId);

if (!paciente) {
  throw new NotFoundError('Paciente no encontrado');
}

    return this.alergiaRepository.create({
      pacienteId: data.pacienteId,
      alergeno: data.alergeno.trim(),
      reaccion: data.reaccion.trim(),
      severidad: data.severidad
    });
  }

  async actualizar(
    id: number,
    data: ActualizarAlergia
  ): Promise<Alergia> {
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

    const alergia = await this.alergiaRepository.update(id, {
      ...(data.alergeno !== undefined && {
        alergeno: data.alergeno.trim()
      }),
      ...(data.reaccion !== undefined && {
        reaccion: data.reaccion.trim()
      }),
      ...(data.severidad !== undefined && {
        severidad: data.severidad
      })
    });

    if (!alergia) {
      throw new NotFoundError('Alergia no encontrada');
    }

    return alergia;
  }

  private validarId(id: number): void {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new BadRequestError('El id debe ser un entero positivo');
    }
  }

  private validarCampos(
    data: ActualizarAlergia,
    obligatorio: boolean
  ): void {
    const camposPermitidos = ['alergeno', 'reaccion', 'severidad'];

    for (const campo of Object.keys(data)) {
      if (!camposPermitidos.includes(campo) && campo !== 'pacienteId') {
        throw new BadRequestError(`Campo no permitido: ${campo}`);
      }
    }

    if (obligatorio) {
      if (
        data.alergeno === undefined ||
        data.reaccion === undefined ||
        data.severidad === undefined
      ) {
        throw new BadRequestError(
          'Alérgeno, reacción y severidad son obligatorios'
        );
      }
    }

    if (data.alergeno !== undefined) {
      if (
        typeof data.alergeno !== 'string' ||
        !data.alergeno.trim() ||
        data.alergeno.trim().length > 150
      ) {
        throw new BadRequestError(
          'El alérgeno debe tener entre 1 y 150 caracteres'
        );
      }
    }

    if (data.reaccion !== undefined) {
      if (
        typeof data.reaccion !== 'string' ||
        !data.reaccion.trim() ||
        data.reaccion.trim().length > 255
      ) {
        throw new BadRequestError(
          'La reacción debe tener entre 1 y 255 caracteres'
        );
      }
    }

    if (
      data.severidad !== undefined &&
      !['leve', 'moderada', 'alta'].includes(data.severidad)
    ) {
      throw new BadRequestError(
        'La severidad debe ser leve, moderada o alta'
      );
    }
  }
}