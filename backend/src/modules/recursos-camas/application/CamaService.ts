import { ICamaService } from './ICamaService';
import { ICamaRepository, FalloCama } from '../domain/ICamaRepository';
import { IHabitacionRepository } from '../domain/IHabitacionRepository';
import {
  IPublicadorEstadoCama,
  IVerificadorIngreso,
} from '../domain/IEventosRecursosCamas';
import { AsignacionCama } from '../domain/AsignacionCama';
import { Cama, CamaMapa } from '../domain/Cama';
import { esEstadoCama } from '../domain/EstadoCama';
import { HistorialEstadoCama } from '../domain/HistorialEstadoCama';
import { AsignarCamaDto } from './dtos/AsignarCamaDto';
import { CambiarEstadoCamaDto } from './dtos/CambiarEstadoCamaDto';
import { CreateCamaDto } from './dtos/CreateCamaDto';
import { FiltrosMapaCamaDto } from './dtos/FiltrosMapaCamaDto';
import { MoverCamaDto } from './dtos/MoverCamaDto';
import { PasarALimpiezaDto } from './dtos/PasarALimpiezaDto';
import { ResponseAsignacionCamaDto } from './dtos/ResponseAsignacionCamaDto';
import { ResponseAsignarCamaDto } from './dtos/ResponseAsignarCamaDto';
import { ResponseCamaDto } from './dtos/ResponseCamaDto';
import { ResponseCamaMapaDto } from './dtos/ResponseCamaMapaDto';
import { ResponseCambioEstadoCamaDto } from './dtos/ResponseCambioEstadoCamaDto';
import { ResponseHistorialEstadoCamaDto } from './dtos/ResponseHistorialEstadoCamaDto';
import { BadRequestError, ConflictError, NotFoundError } from '../../../shared/errors';

/** Usuario que figura en el historial cuando el cambio lo hace el sistema (p. ej. alta). */
export const USUARIO_SISTEMA_ID = 0;

export class CamaService implements ICamaService {
  private verificadorIngreso: IVerificadorIngreso | null = null;

  constructor(
    private readonly camaRepository: ICamaRepository,
    private readonly habitacionRepository: IHabitacionRepository,
    private readonly publicadorEstadoCama: IPublicadorEstadoCama,
  ) {}

  /** Se conecta desde la composición de módulos (Recursos no conoce a Enfermería). */
  definirVerificadorIngreso(verificador: IVerificadorIngreso): void {
    this.verificadorIngreso = verificador;
  }

  private toCamaDto(cama: Cama): ResponseCamaDto {
    return {
      id: cama.id,
      habitacion_id: cama.habitacion_id,
      estado: cama.estado,
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
    });
  }

  async crear(dto: CreateCamaDto): Promise<ResponseCamaDto> {
    const habitacionId = this.exigirEntero(dto?.habitacion_id, 'habitacion_id', 1);
    const habitacion = await this.habitacionRepository.findById(habitacionId);
    if (!habitacion) throw new NotFoundError('Habitación no encontrada');

    const cama = await this.camaRepository.crear({
      habitacion_id: habitacionId,
    });
    return this.toCamaDto(cama);
  }

  async obtener(id: number): Promise<ResponseCamaDto> {
    const cama = await this.camaRepository.buscarPorId(id);
    if (!cama) throw new NotFoundError('Cama no encontrada');
    return this.toCamaDto(cama);
  }

  async mover(id: number, dto: MoverCamaDto): Promise<ResponseCamaMapaDto> {
    const habitacionId = this.exigirEntero(dto?.habitacion_id, 'habitacion_id', 1);
    const habitacion = await this.habitacionRepository.findById(habitacionId);
    if (!habitacion) throw new NotFoundError('Habitación no encontrada');

    const existente = await this.camaRepository.buscarPorId(id);
    if (!existente) throw new NotFoundError('Cama no encontrada');

    const actualizada = await this.camaRepository.actualizarHabitacion(id, habitacionId);
    if (!actualizada) throw new NotFoundError('Cama no encontrada');

    return {
      ...this.toCamaDto(actualizada),
      sector: habitacion.sector,
    };
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

    // HU: se asigna cama a un paciente ya ingresado (con internación activa).
    if (this.verificadorIngreso) {
      const ingresado = await this.verificadorIngreso.tieneInternacionActiva(pacienteId);
      if (!ingresado) {
        throw new ConflictError(
          'El paciente no tiene una internación activa: debe ingresarse antes de asignarle una cama',
        );
      }
    }

    const resultado = await this.camaRepository.asignar({
      camaId: id,
      pacienteId,
      usuarioId,
    });
    if (!resultado.ok) this.fallar(resultado.fallo);
    if (!resultado.asignacion) {
      throw new ConflictError('La cama ya tiene una asignación abierta');
    }

    await this.publicar(resultado.cama, resultado.historial);
    try {
      await this.publicadorEstadoCama.publicarAsignacion?.({
        cama_id: resultado.cama.id,
        paciente_id: resultado.asignacion.paciente_id,
        usuario_id: usuarioId,
        fecha_asignacion: resultado.asignacion.fecha_asignacion,
      });
    } catch (error) {
      console.error('No se pudo publicar la asignación de cama', error);
    }
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
    if (dto.estado === 'En limpieza') {
      throw new ConflictError(
        'La cama pasa a En limpieza solo con el alta del paciente o por un administrador',
      );
    }

    const usuarioId = this.exigirEntero(dto.usuario_id, 'usuario_id', 1);
    const resultado = await this.camaRepository.cambiarEstado({
      camaId: id,
      estadoNuevo: dto.estado,
      usuarioId,
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
   * Alta médica: la cama ocupada pasa a "En limpieza" y queda bloqueada hasta
   * que maestranza confirme la higiene. Lo dispara el evento PACIENTE_DADO_DE_ALTA.
   * La transición se valida bajo lock contra el estado real (solo una cama
   * Ocupada puede pasar a limpieza). Devuelve null si la cama ya no estaba
   * ocupada (evento repetido).
   */
  async liberarPorAlta(
    id: number,
    usuarioId: number = USUARIO_SISTEMA_ID,
  ): Promise<ResponseCambioEstadoCamaDto | null> {
    const resultado = await this.camaRepository.cambiarEstado({
      camaId: id,
      estadoNuevo: 'En limpieza',
      usuarioId,
    });
    if (!resultado.ok) {
      if (resultado.fallo === 'transicion') return null;
      this.fallar(resultado.fallo);
    }

    await this.publicar(resultado.cama, resultado.historial);
    return {
      cama: this.toCamaDto(resultado.cama),
      historial: this.toHistorialDto(resultado.historial),
      asignacion: resultado.asignacion ? this.toAsignacionDto(resultado.asignacion) : null,
    };
  }

  /** Sector de internación de una cama (para ubicar alertas clínicas). */
  async obtenerSector(id: number): Promise<string | null> {
    const cama = await this.camaRepository.buscarPorId(id);
    if (!cama) return null;
    const habitacion = await this.habitacionRepository.findById(cama.habitacion_id);
    return habitacion?.sector ?? null;
  }

  /**
   * Pasa a limpieza de forma manual. Solo para Administrador (HTTP protegido).
   * El flujo normal es liberarPorAlta ante PACIENTE_DADO_DE_ALTA.
   */
  async pasarAEnLimpieza(
    id: number,
    dto: PasarALimpiezaDto,
  ): Promise<ResponseCambioEstadoCamaDto> {
    const usuarioId = this.exigirEntero(dto?.usuario_id, 'usuario_id', 1);
    const resultado = await this.camaRepository.cambiarEstado({
      camaId: id,
      estadoNuevo: 'En limpieza',
      usuarioId,
    });
    if (!resultado.ok) this.fallar(resultado.fallo);

    await this.publicar(resultado.cama, resultado.historial);
    return {
      cama: this.toCamaDto(resultado.cama),
      historial: this.toHistorialDto(resultado.historial),
      asignacion: resultado.asignacion ? this.toAsignacionDto(resultado.asignacion) : null,
    };
  }
}