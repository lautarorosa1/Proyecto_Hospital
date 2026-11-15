import { AppDataSource } from '../../../data-source';
import { InternacionEntity } from './InternacionEntity';

import type { IInternacionRepository } from '../domain/InternacionRepository';
import type { Internacion } from '../domain/Internaciones';

export class InternacionRepositoryPostgres
  implements IInternacionRepository {

  private get repository() {
    return AppDataSource.getRepository(InternacionEntity);
  }

  // REGISTRAR INTERNACIÓN
  async create(
    datos: Omit<Internacion, 'id'>
  ): Promise<Internacion> {

    const internacion = this.repository.create({
      paciente: { id: datos.pacienteId } as InternacionEntity['paciente'],
      fechaIngreso: datos.fechaIngreso,
      fechaEgreso: datos.fechaEgreso,
      motivoIngreso: datos.motivoIngreso,
      estado: datos.estado,
      observaciones: datos.observaciones,
      tipoIngreso: datos.tipoIngreso ?? 'GENERAL',
      camaId: datos.camaId ?? null,
    });

    const guardada = await this.repository.save(internacion);

    return {
      id: guardada.id,
      pacienteId: datos.pacienteId,
      fechaIngreso: guardada.fechaIngreso,
      fechaEgreso: guardada.fechaEgreso,
      motivoIngreso: guardada.motivoIngreso,
      estado: guardada.estado,
      observaciones: guardada.observaciones,
      tipoIngreso: guardada.tipoIngreso,
      camaId: guardada.camaId ?? undefined,
    };
  }

  // BUSCAR POR ID
  async findById(id: number): Promise<Internacion | null> {
    const internacion = await this.repository.findOne({
      where: { id },
      relations: { paciente: true },
    });

    if (!internacion) return null;

    return this.toDomain(internacion);
  }

  // BUSCAR POR PACIENTE
  async findByPacienteId(pacienteId: number): Promise<Internacion[]> {
    const internaciones = await this.repository.find({
      where: { paciente: { id: pacienteId } },
      relations: { paciente: true },
    });

    return internaciones.map((item) => this.toDomain(item));
  }

  // LISTAR TODAS
  async findAll(): Promise<Internacion[]> {
    const internaciones = await this.repository.find({
      relations: { paciente: true },
    });

    return internaciones.map((item) => this.toDomain(item));
  }

  // ACTUALIZAR
  async update(
    id: number,
    datos: Partial<Omit<Internacion, 'id'>>
  ): Promise<Internacion | null> {

    const internacion = await this.repository.findOne({
      where: { id },
      relations: { paciente: true },
    });

    if (!internacion) return null;

    if (datos.pacienteId !== undefined) {
      internacion.paciente = {
        id: datos.pacienteId,
      } as InternacionEntity['paciente'];
    }

    if (datos.fechaIngreso !== undefined) {
      internacion.fechaIngreso = datos.fechaIngreso;
    }

    if (datos.fechaEgreso !== undefined) {
      internacion.fechaEgreso = datos.fechaEgreso;
    }

    if (datos.motivoIngreso !== undefined) {
      internacion.motivoIngreso = datos.motivoIngreso;
    }

    if (datos.estado !== undefined) {
      internacion.estado = datos.estado;
    }

    if (datos.observaciones !== undefined) {
      internacion.observaciones = datos.observaciones;
    }

    if (datos.tipoIngreso !== undefined) {
      internacion.tipoIngreso = datos.tipoIngreso;
    }

    if (datos.camaId !== undefined) {
      internacion.camaId = datos.camaId;
    }

    await this.repository.save(internacion);

    const actualizada = await this.repository.findOne({
      where: { id },
      relations: { paciente: true },
    });

    if (!actualizada) return null;

    return this.toDomain(actualizada);
  }

  // CONVERTIR ENTITY A DOMAIN
  private toDomain(internacion: InternacionEntity): Internacion {
    return {
      id: internacion.id,
      pacienteId: internacion.paciente.id,
      fechaIngreso: internacion.fechaIngreso,
      fechaEgreso: internacion.fechaEgreso,
      motivoIngreso: internacion.motivoIngreso,
      estado: internacion.estado,
      observaciones: internacion.observaciones,
      tipoIngreso: internacion.tipoIngreso,
      camaId: internacion.camaId ?? undefined,
    };
  }
}