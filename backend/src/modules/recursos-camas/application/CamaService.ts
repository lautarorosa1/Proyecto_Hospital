import { ICamaService } from './ICamaService';
import { ICamaRepository, FalloCama } from '../domain/ICamaRepository';
import { IHabitacionRepository } from '../domain/IHabitacionRepository';
import { IPublicadorEstadoCama } from '../domain/IEventosRecursosCamas';
import { AsignacionCama } from '../domain/AsignacionCama';
import { Cama, CamaMapa } from '../domain/Cama';
import { esEstadoCama } from '../domain/EstadoCama';
import { HistorialEstadoCama } from '../domain/HistorialEstadoCama';
import { AsignarCamaDto } from './dtos/AsignarCamaDto';
import { CambiarEstadoCamaDto } from './dtos/CambiarEstadoCamaDto';
import { CreateCamaDto } from './dtos/CreateCamaDto';
import { FiltrosMapaCamaDto } from './dtos/FiltrosMapaCamaDto';
import { PasarALimpiezaDto } from './dtos/PasarALimpiezaDto';
import { ResponseAsignacionCamaDto } from './dtos/ResponseAsignacionCamaDto';
import { ResponseAsignarCamaDto } from './dtos/ResponseAsignarCamaDto';
import { ResponseCamaDto } from './dtos/ResponseCamaDto';
import { ResponseCamaMapaDto } from './dtos/ResponseCamaMapaDto';
import { ResponseCambioEstadoCamaDto } from './dtos/ResponseCambioEstadoCamaDto';
import { ResponseHistorialEstadoCamaDto } from './dtos/ResponseHistorialEstadoCamaDto';
import { BadRequestError, ConflictError, NotFoundError } from '../../../shared/errors';

export class CamaService implements ICamaService {
  constructor(
    private readonly camaRepository: ICamaRepository,
    private readonly habitacionRepository: IHabitacionRepository,
    private readonly publicadorEstadoCama: IPublicadorEstadoCama,
  ) {}

  private toCamaDto(cama: Cama): ResponseCamaDto {
    return {
      id: cama.id,
      numero: cama.numero,
      habitacion_id: cama.habitacion_id,
      estado: cama.estado,
      version: cama.version,
    };
  }

  private toMapaDto(cama: CamaMapa): ResponseCamaMapaDto {
    return {
      ...this.toCamaDto(cama),
      sector: cama.sector,
    };
  }

  private toHistorialDto(historial: HistorialEstadoCama): ResponseHistorialEstadoCamaDto {
    return {
      id: historial.id,
      cama_id: historial.cama_id,
      estado_anterior: historial.estado_anterior,
      estado_nuevo: historial.estado_nuevo,
      fecha_cambio: historial.fecha_cambio,
      usuario_id: historial.usuario_id,
    };
  }

  private toAsignacionDto(asignacion: AsignacionCama): ResponseAsignacionCamaDto {
    return {
      id: asignacion.id,
      cama_id: asignacion.cama_id,
      paciente_id: asignacion.paciente_id,
      fecha_asignacion: asignacion.fecha_asignacion,
      fecha_liberacion: asignacion.fecha_liberacion,
    };
  }

  private exigirTexto(valor: unknown, campo: string): string {
    if (typeof valor !== 'string' || valor.trim() === '') {
      throw new BadRequestError(`El ${campo} es obligatorio`);
    }
    return valor.trim();
  }

  private exigirEntero(valor: unknown, campo: string, minimo: number): number {
    if (typeof valor !== 'number' || !Number.isInteger(valor) || valor < minimo) {
      const limite = minimo === 0 ? 'mayor o igual a 0' : 'positivo';
      throw new BadRequestError(`El ${campo} debe ser un entero ${limite}`);
    }
    return valor;
  }

  private fallar(fallo: FalloCama): never {
    if (fallo === 'no_encontrada') throw new NotFoundError('Cama no encontrada');
    if (fallo === 'version') throw new ConflictError('La versión de la cama no coincide');
    if (fallo === 'doble_asignacion') {
      throw new ConflictError('La cama ya tiene una asignación abierta');
    }
    throw new ConflictError('Transición de estado no permitida');
  }

  private async publicar(cama: Cama, historial: HistorialEstadoCama): Promise<void> {
    await this.publicadorEstadoCama.publicarCambioEstado({
      cama_id: cama.id,
      estado_anterior: historial.estado_anterior,
      estado_nuevo: historial.estado_nuevo,
      usuario_id: historial.usuario_id,
      fecha_cambio: historial.fecha_cambio,
      version: cama.version,
    });
  }

  async crear(dto: CreateCamaDto): Promise<ResponseCamaDto> {
    const numero = this.exigirTexto(dto?.numero, 'número');
    const habitacionId = this.exigirEntero(dto?.habitacion_id, 'habitacion_id', 1);
    const habitacion = await this.habitacionRepository.findById(habitacionId);
    if (!habitacion) throw new NotFoundError('Habitación no encontrada');

    const cama = await this.camaRepository.crear({
      numero,
      habitacion_id: habitacionId,
    });
    return this.toCamaDto(cama);
  }

  async obtener(id: number): Promise<ResponseCamaDto> {
    const cama = await this.camaRepository.buscarPorId(id);
    if (!cama) throw new NotFoundError('Cama no encontrada');
    return this.toCamaDto(cama);
  }

  async mapa(filtro: FiltrosMapaCamaDto): Promise<ResponseCamaMapaDto[]> {
    let estado = undefined;
    if (filtro.estado !== undefined) {
      if (!esEstadoCama(filtro.estado)) {
        throw new BadRequestError(
          'El estado debe ser Libre, Ocupada, En limpieza o Bloqueada',
        );
      }
      estado = filtro.estado;
    }

    let sector = undefined;
    if (filtro.sector !== undefined) {
      sector = this.exigirTexto(filtro.sector, 'sector');
    }

    const camas = await this.camaRepository.buscarMapa({ estado, sector });
    return camas.map((cama) => this.toMapaDto(cama));
  }

  async asignar(id: number, dto: AsignarCamaDto): Promise<ResponseAsignarCamaDto> {
    const pacienteId = this.exigirEntero(dto?.paciente_id, 'paciente_id', 1);
    const usuarioId = this.exigirEntero(dto?.usuario_id, 'usuario_id', 1);
    const version = this.exigirEntero(dto?.version, 'version', 0);

    const resultado = await this.camaRepository.asignar({
      camaId: id,
      pacienteId,
      usuarioId,
      version,
    });
    if (!resultado.ok) this.fallar(resultado.fallo);
    if (!resultado.asignacion) {
      throw new ConflictError('La cama ya tiene una asignación abierta');
    }

    await this.publicar(resultado.cama, resultado.historial);
    return {
      cama: this.toCamaDto(resultado.cama),
      historial: this.toHistorialDto(resultado.historial),
      asignacion: this.toAsignacionDto(resultado.asignacion),
    };
  }

  async cambiarEstado(
    id: number,
    dto: CambiarEstadoCamaDto,
  ): Promise<ResponseCambioEstadoCamaDto> {
    if (typeof dto?.estado !== 'string' || !esEstadoCama(dto.estado)) {
      throw new BadRequestError(
        'El estado debe ser Libre, Ocupada, En limpieza o Bloqueada',
      );
    }
    if (dto.estado === 'Ocupada') {
      throw new ConflictError('La cama pasa a Ocupada solo al asignar un paciente');
    }

    const usuarioId = this.exigirEntero(dto.usuario_id, 'usuario_id', 1);
    const version = this.exigirEntero(dto.version, 'version', 0);
    const resultado = await this.camaRepository.cambiarEstado({
      camaId: id,
      estadoNuevo: dto.estado,
      usuarioId,
      version,
    });
    if (!resultado.ok) this.fallar(resultado.fallo);

    await this.publicar(resultado.cama, resultado.historial);
    return {
      cama: this.toCamaDto(resultado.cama),
      historial: this.toHistorialDto(resultado.historial),
      asignacion: resultado.asignacion ? this.toAsignacionDto(resultado.asignacion) : null,
    };
  }

  /**
   * Listo para el evento de alta de internación.
   * Quien lo llame pasa el id de la cama, el usuario y la version leída.
   */
  async pasarAEnLimpieza(
    id: number,
    dto: PasarALimpiezaDto,
  ): Promise<ResponseCambioEstadoCamaDto> {
    return this.cambiarEstado(id, {
      estado: 'En limpieza',
      usuario_id: dto?.usuario_id,
      version: dto?.version,
    });
  }
}