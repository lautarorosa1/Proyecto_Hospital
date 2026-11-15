
import { AppDataSource } from '../../../data-source';
import { MedicacionEntity } from './MedicacionEntity';

import type { IMedicacionesRepository } from '../domain/MedicacionesRepository';
import type { Medicacion } from '../domain/Medicaciones';

export class MedicacionesRepositoryPostgres
  implements IMedicacionesRepository {

  private get repository() {
    return AppDataSource.getRepository(MedicacionEntity);
  }

  async create(
    datos: Omit<Medicacion, 'id'>
  ): Promise<Medicacion> {

    const medicacion = this.repository.create({
      internacion: {
        id: datos.internacionId,
      } as MedicacionEntity['internacion'],

      profesional: {
        id: datos.profesionalId,
      } as MedicacionEntity['profesional'],

      nombre: datos.nombre,
      dosis: datos.dosis,
      frecuencia: datos.frecuencia,
      viaAdministracion: datos.viaAdministracion,
      fechaInicio: datos.fechaInicio,
      fechaFin: datos.fechaFin,
      estado: datos.estado,
      observaciones: datos.observaciones,
      insumoId: datos.insumoId ?? null,
      cantidadInsumo: datos.cantidadInsumo ?? 1,
    });

    const guardada = await this.repository.save(medicacion);

    return this.toDomain(guardada);
  }

  async findById(id: number): Promise<Medicacion | null> {
    const medicacion = await this.repository.findOne({
      where: { id },
      relations: {
        internacion: true,
        profesional: true,
      },
    });

    if (!medicacion) return null;

    return this.toDomain(medicacion);
  }

  async findByInternacionId(
    internacionId: number
  ): Promise<Medicacion[]> {

    const medicaciones = await this.repository.find({
      where: {
        internacion: { id: internacionId },
      },
      relations: {
        internacion: true,
        profesional: true,
      },
    });

    return medicaciones.map((item) => this.toDomain(item));
  }

  async findAll(): Promise<Medicacion[]> {
    const medicaciones = await this.repository.find({
      relations: {
        internacion: true,
        profesional: true,
      },
    });

    return medicaciones.map((item) => this.toDomain(item));
  }

  async update(
    id: number,
    datos: Partial<Omit<Medicacion, 'id'>>
  ): Promise<Medicacion | null> {

    const medicacion = await this.repository.findOne({
      where: { id },
      relations: {
        internacion: true,
        profesional: true,
      },
    });

    if (!medicacion) return null;

    if (datos.internacionId !== undefined) {
      medicacion.internacion = {
        id: datos.internacionId,
      } as MedicacionEntity['internacion'];
    }

    if (datos.profesionalId !== undefined) {
      medicacion.profesional = {
        id: datos.profesionalId,
      } as MedicacionEntity['profesional'];
    }

    if (datos.nombre !== undefined) medicacion.nombre = datos.nombre;
    if (datos.dosis !== undefined) medicacion.dosis = datos.dosis;
    if (datos.frecuencia !== undefined) medicacion.frecuencia = datos.frecuencia;

    if (datos.viaAdministracion !== undefined) {
      medicacion.viaAdministracion = datos.viaAdministracion;
    }

    if (datos.fechaInicio !== undefined) medicacion.fechaInicio = datos.fechaInicio;
    if (datos.fechaFin !== undefined) medicacion.fechaFin = datos.fechaFin;
    if (datos.estado !== undefined) medicacion.estado = datos.estado;
    if (datos.observaciones !== undefined) medicacion.observaciones = datos.observaciones;
    if (datos.insumoId !== undefined) medicacion.insumoId = datos.insumoId;
    if (datos.cantidadInsumo !== undefined) medicacion.cantidadInsumo = datos.cantidadInsumo;

    const actualizada = await this.repository.save(medicacion);

    return this.toDomain(actualizada);
  }

  private toDomain(medicacion: MedicacionEntity): Medicacion {
    return {
      id: medicacion.id,
      internacionId: medicacion.internacion.id,
      profesionalId: medicacion.profesional.id,
      nombre: medicacion.nombre,
      dosis: medicacion.dosis,
      frecuencia: medicacion.frecuencia,
      viaAdministracion: medicacion.viaAdministracion,
      fechaInicio: medicacion.fechaInicio,
      fechaFin: medicacion.fechaFin ?? undefined,
      estado: medicacion.estado,
      observaciones: medicacion.observaciones,
      insumoId: medicacion.insumoId ?? undefined,
      cantidadInsumo: medicacion.cantidadInsumo ?? 1,
    };
  }
}