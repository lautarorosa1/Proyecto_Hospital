import { AppDataSource } from '../../../data-source';
import { IndicacionEntity } from './IndicacionEntity';
import type { IIndicacionesRepository } from '../domain/IndicacionesRepository';
import type { Indicacion } from '../domain/Indicaciones';

export class IndicacionesRepositoryPostgres
  implements IIndicacionesRepository {

  private get repository() {
    return AppDataSource.getRepository(IndicacionEntity);
  }

  async create(
    datos: Omit<Indicacion, 'id'>
  ): Promise<Indicacion> {

    const indicacion = this.repository.create({
      internacion: { id: datos.internacionId } as IndicacionEntity['internacion'],
      profesional: { id: datos.profesionalId } as IndicacionEntity['profesional'],
      descripcion: datos.descripcion,
      fecha: new Date(datos.fecha),
      estado: datos.estado,
      observaciones: datos.observaciones,
    });

    const guardada = await this.repository.save(indicacion);

    return {
      id: guardada.id,
      internacionId: datos.internacionId,
      profesionalId: datos.profesionalId,
      descripcion: guardada.descripcion,
      fecha: guardada.fecha.toISOString(),
      estado: guardada.estado,
      observaciones: guardada.observaciones,
    };
  }

  async findById(id: number): Promise<Indicacion | null> {
    const indicacion = await this.repository.findOne({
      where: { id },
      relations: {
        internacion: true,
        profesional: true,
      },
    });

    if (!indicacion) return null;

    return this.toDomain(indicacion);
  }

  async findByInternacionId(
    internacionId: number
  ): Promise<Indicacion[]> {
    const indicaciones = await this.repository.find({
      where: {
        internacion: { id: internacionId },
      },
      relations: {
        internacion: true,
        profesional: true,
      },
    });

    return indicaciones.map((item) => this.toDomain(item));
  }

  async findAll(): Promise<Indicacion[]> {
    const indicaciones = await this.repository.find({
      relations: {
        internacion: true,
        profesional: true,
      },
    });

    return indicaciones.map((item) => this.toDomain(item));
  }

  async update(
    id: number,
    datos: Partial<Omit<Indicacion, 'id'>>
  ): Promise<Indicacion | null> {

    const indicacion = await this.repository.findOne({
      where: { id },
      relations: {
        internacion: true,
        profesional: true,
      },
    });

    if (!indicacion) return null;

    if (datos.internacionId !== undefined) {
      indicacion.internacion = {
        id: datos.internacionId,
      } as IndicacionEntity['internacion'];
    }

    if (datos.profesionalId !== undefined) {
      indicacion.profesional = {
        id: datos.profesionalId,
      } as IndicacionEntity['profesional'];
    }

    if (datos.descripcion !== undefined) {
      indicacion.descripcion = datos.descripcion;
    }

    if (datos.fecha !== undefined) {
      indicacion.fecha = new Date(datos.fecha);
    }

    if (datos.estado !== undefined) {
      indicacion.estado = datos.estado;
    }

    if (datos.observaciones !== undefined) {
      indicacion.observaciones = datos.observaciones;
    }

    await this.repository.save(indicacion);

    const actualizada = await this.repository.findOne({
      where: { id },
      relations: {
        internacion: true,
        profesional: true,
      },
    });

    if (!actualizada) return null;

    return this.toDomain(actualizada);
  }

  private toDomain(
    indicacion: IndicacionEntity
  ): Indicacion {
    return {
      id: indicacion.id,
      internacionId: indicacion.internacion.id,
      profesionalId: indicacion.profesional.id,
      descripcion: indicacion.descripcion,
      fecha: indicacion.fecha.toISOString(),
      estado: indicacion.estado,
      observaciones: indicacion.observaciones,
    };
  }
}