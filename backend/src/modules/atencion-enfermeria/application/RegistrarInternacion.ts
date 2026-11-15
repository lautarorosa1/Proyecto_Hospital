import type { Internacion } from '../domain/Internaciones';
import type { IInternacionRepository } from '../domain/InternacionRepository';
import type { IEventosEnfermeria } from '../domain/IEventosEnfermeria';
import { esTipoIngreso } from '../domain/TipoIngreso';
import type { GenerarProtocoloDeIngreso } from './protocolos/GenerarProtocoloDeIngreso';
import { BadRequestError, ConflictError } from '../../../shared/errors';

export interface DependenciasIngreso {
  /** Si se indica, al ingresar se arma el protocolo de cuidados (patrón Builder). */
  generarProtocolo?: GenerarProtocoloDeIngreso;
  eventos?: IEventosEnfermeria;
}

export class RegistrarInternacion {
  constructor(
    private readonly repositorio: IInternacionRepository,
    private readonly dependencias: DependenciasIngreso = {}
  ) {}

  async ejecutar(
    datos: Omit<Internacion, 'id'>
  ): Promise<Internacion> {
    if (!Number.isInteger(datos.pacienteId) || datos.pacienteId <= 0) {
      throw new Error('El ID del paciente debe ser positivo.');
    }

    if (!datos.motivoIngreso.trim()) {
      throw new Error('El motivo de ingreso es obligatorio.');
    }

    if (!datos.fechaIngreso || Number.isNaN(Date.parse(datos.fechaIngreso))) {
      throw new Error('La fecha de ingreso no es válida.');
    }

    if (datos.tipoIngreso !== undefined && !esTipoIngreso(datos.tipoIngreso)) {
      throw new BadRequestError(
        'El tipo de ingreso debe ser CIRUGIA_PROGRAMADA, INFECCION_RESPIRATORIA o GENERAL.'
      );
    }

    // Un paciente no puede tener dos internaciones activas a la vez.
    const previas = await this.repositorio.findByPacienteId(datos.pacienteId);
    if (previas.some((item) => item.estado === 'ACTIVA')) {
      throw new ConflictError('El paciente ya tiene una internación activa.');
    }

    const internacion = await this.repositorio.create({
      ...datos,
      estado: datos.estado ?? 'ACTIVA',
      tipoIngreso: datos.tipoIngreso ?? 'GENERAL',
    });

    // El protocolo se genera en el mismo ingreso, pero un fallo acá no debe
    // deshacer la internación (el hecho clínico ya ocurrió).
    let protocoloId: number | undefined;
    if (this.dependencias.generarProtocolo) {
      try {
        const protocolo = await this.dependencias.generarProtocolo.ejecutar(internacion);
        protocoloId = protocolo.id;
      } catch (error) {
        console.error('[Enfermería] No se pudo generar el protocolo de ingreso', error);
      }
    }

    this.dependencias.eventos?.internacionRegistrada({
      internacionId: internacion.id,
      pacienteId: internacion.pacienteId,
      tipoIngreso: internacion.tipoIngreso ?? 'GENERAL',
      protocoloId,
      timestamp: new Date(),
    });

    return internacion;
  }
}
