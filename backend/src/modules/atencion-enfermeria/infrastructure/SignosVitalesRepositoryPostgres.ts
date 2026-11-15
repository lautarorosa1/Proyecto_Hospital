import { AppDataSource } from '../../../data-source';
import { SignosVitalesEntity } from './SignosVitalesEntity';

import type { ISignosVitalesRepository } from '../domain/SignosVitalesRepository';
import type { SignosVitales } from '../domain/SignosVitales';

export class SignosVitalesRepositoryPostgres
  implements ISignosVitalesRepository {

  private get repository() {
    return AppDataSource.getRepository(SignosVitalesEntity);
  }

  // Registrar signos vitales
  async create(
    datos: Omit<SignosVitales, 'id'>
  ): Promise<SignosVitales> {

    const registro = this.repository.create({
      internacion: {
        id: datos.internacionId,
      } as SignosVitalesEntity['internacion'],

      profesional: {
        id: datos.profesionalId,
      } as SignosVitalesEntity['profesional'],

      fechaHora: new Date(datos.fechaHora),
      temperatura: datos.temperatura,
      frecuenciaCardiaca: datos.frecuenciaCardiaca,
      frecuenciaRespiratoria: datos.frecuenciaRespiratoria,
      presionSistolica: datos.presionSistolica,
      presionDiastolica: datos.presionDiastolica,
      saturacionOxigeno: datos.saturacionOxigeno,
      observaciones: datos.observaciones,
      alerta: datos.alerta ?? false,
    });

    const guardado = await this.repository.save(registro);

    return this.toDomain(guardado);
  }

  // Buscar signos vitales por ID
  async findById(
    id: number
  ): Promise<SignosVitales | null> {

    const registro = await this.repository.findOne({
      where: { id },
      relations: {
        internacion: true,
        profesional: true,
      },
    });

    if (!registro) return null;

    return this.toDomain(registro);
  }

  // Buscar signos vitales por internación
  async findByInternacionId(
    internacionId: number
  ): Promise<SignosVitales[]> {

    const registros = await this.repository.find({
      where: {
        internacion: { id: internacionId },
      },
      relations: {
        internacion: true,
        profesional: true,
      },
      order: {
        fechaHora: 'DESC',
      },
    });

    return registros.map((item) => this.toDomain(item));
  }

  // Actualizar signos vitales
  async update(
    id: number,
    datos: Partial<Omit<SignosVitales, 'id'>>
  ): Promise<SignosVitales | null> {

    const registro = await this.repository.findOne({
      where: { id },
      relations: {
        internacion: true,
        profesional: true,
      },
    });

    if (!registro) return null;

    if (datos.internacionId !== undefined) {
      registro.internacion = {
        id: datos.internacionId,
      } as SignosVitalesEntity['internacion'];
    }

    if (datos.profesionalId !== undefined) {
      registro.profesional = {
        id: datos.profesionalId,
      } as SignosVitalesEntity['profesional'];
    }

    if (datos.fechaHora !== undefined) {
      registro.fechaHora = new Date(datos.fechaHora);
    }

    if (datos.temperatura !== undefined) {
      registro.temperatura = datos.temperatura;
    }

    if (datos.frecuenciaCardiaca !== undefined) {
      registro.frecuenciaCardiaca = datos.frecuenciaCardiaca;
    }

    if (datos.frecuenciaRespiratoria !== undefined) {
      registro.frecuenciaRespiratoria = datos.frecuenciaRespiratoria;
    }

    if (datos.presionSistolica !== undefined) {
      registro.presionSistolica = datos.presionSistolica;
    }

    if (datos.presionDiastolica !== undefined) {
      registro.presionDiastolica = datos.presionDiastolica;
    }

    if (datos.saturacionOxigeno !== undefined) {
      registro.saturacionOxigeno = datos.saturacionOxigeno;
    }

    if (datos.observaciones !== undefined) {
      registro.observaciones = datos.observaciones;
    }

    if (datos.alerta !== undefined) {
      registro.alerta = datos.alerta;
    }

    await this.repository.save(registro);

    const actualizado = await this.repository.findOne({
      where: { id },
      relations: {
        internacion: true,
        profesional: true,
      },
    });

    if (!actualizado) return null;

    return this.toDomain(actualizado);
  }

  // Eliminar signos vitales
  async delete(id: number): Promise<boolean> {

    const resultado = await this.repository.delete(id);

    return resultado.affected !== 0 && resultado.affected !== null;
  }

  // Convertir entidad a modelo de dominio
  private toDomain(
    registro: SignosVitalesEntity
  ): SignosVitales {

    return {
      id: registro.id,
      internacionId: registro.internacion.id,
      profesionalId: registro.profesional.id,
      fechaHora: registro.fechaHora.toISOString(),
      temperatura: registro.temperatura,
      frecuenciaCardiaca: registro.frecuenciaCardiaca,
      frecuenciaRespiratoria: registro.frecuenciaRespiratoria,
      presionSistolica: registro.presionSistolica,
      presionDiastolica: registro.presionDiastolica,
      saturacionOxigeno: registro.saturacionOxigeno,
      observaciones: registro.observaciones ?? undefined,
      alerta: registro.alerta ?? false,
    };
  }
}