import type { Medicacion } from '../domain/Medicaciones';
import type { IMedicacionesRepository } from '../domain/MedicacionesRepository';
import type { IInternacionRepository } from '../domain/InternacionRepository';
import type { IAlergiasPaciente } from '../domain/IEventosEnfermeria';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../../../shared/errors';

export interface DependenciasMedicacion {
  internaciones: IInternacionRepository;
  /** Historia Clínica: impide indicar un fármaco al que el paciente es alérgico. */
  alergias: IAlergiasPaciente;
}

export class RegistrarMedicacion {
  constructor(
    private readonly repositorio: IMedicacionesRepository,
    private readonly dependencias?: DependenciasMedicacion
  ) {}

  async ejecutar(
    datos: Omit<Medicacion, 'id'>
  ): Promise<Medicacion> {

    if (!Number.isInteger(datos.internacionId) || datos.internacionId <= 0) {
      throw new Error('El ID de la internación debe ser positivo.');
    }

    if (!Number.isInteger(datos.profesionalId) || datos.profesionalId <= 0) {
      throw new Error('El ID del profesional debe ser positivo.');
    }

    if (!datos.nombre.trim()) {
      throw new Error('El nombre del medicamento es obligatorio.');
    }

    if (!datos.dosis.trim()) {
      throw new Error('La dosis es obligatoria.');
    }

    if (!datos.frecuencia.trim()) {
      throw new Error('La frecuencia es obligatoria.');
    }

    if (!datos.viaAdministracion.trim()) {
      throw new Error('La vía de administración es obligatoria.');
    }

    if (!datos.fechaInicio || Number.isNaN(Date.parse(datos.fechaInicio))) {
      throw new Error('La fecha de inicio no es válida.');
    }

    if (
      datos.insumoId !== undefined &&
      (!Number.isInteger(datos.insumoId) || datos.insumoId <= 0)
    ) {
      throw new BadRequestError('El ID del insumo debe ser positivo.');
    }

    if (
      datos.cantidadInsumo !== undefined &&
      (!Number.isInteger(datos.cantidadInsumo) || datos.cantidadInsumo <= 0)
    ) {
      throw new BadRequestError('La cantidad de insumo por dosis debe ser un entero positivo.');
    }

    // Enfermería ↔ Historia Clínica: se consulta el registro de alergias.
    if (this.dependencias) {
      const internacion = await this.dependencias.internaciones.findById(
        datos.internacionId
      );
      if (!internacion) {
        throw new NotFoundError('No se encontró la internación.');
      }

      const alergeno = await this.dependencias.alergias.alergiaA(
        internacion.pacienteId,
        datos.nombre
      );
      if (alergeno) {
        throw new ConflictError(
          `El paciente es alérgico a ${alergeno}: no se puede registrar ${datos.nombre.trim()}.`
        );
      }
    }

    return await this.repositorio.create(datos);
  }
}