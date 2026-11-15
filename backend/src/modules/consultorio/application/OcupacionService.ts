import type { IEventBus } from '../../../shared/domain/events/IEventBus';
import { DomainEvents } from '../../../shared/domain/events/DomainEvents';
import { BadRequestError, ConflictError, NotFoundError } from '../../../shared/errors';
import type { IHabitacionRepository } from '../../recursos-camas/domain/IHabitacionRepository';
import type { Habitacion } from '../../recursos-camas/domain/Habitacion';
import type { IProfesionalRepository } from '../../admision/profesionales/domain/IProfesionalRepository';
import type { OcupacionConsultorio } from '../domain/OcupacionConsultorio';
import type { IOcupacionRepository } from '../domain/IOcupacionRepository';
import type {
  AbrirConsultorioDto,
  ConsultorioEstadoDto,
  OcupacionDto,
} from './dtos/ConsultorioDtos';

/**
 * Un profesional que atiende turnos ocupa una habitación de tipo CONSULTORIO.
 * Abre el consultorio al empezar y lo cierra al terminar; mientras tanto nadie
 * más puede usar esa sala y él no puede ocupar otra.
 */
export class OcupacionService {
  constructor(
    private readonly ocupaciones: IOcupacionRepository,
    private readonly habitaciones: IHabitacionRepository,
    private readonly profesionales: IProfesionalRepository,
    private readonly bus: IEventBus,
  ) {}

  private exigirId(valor: unknown, campo: string): number {
    if (typeof valor !== 'number' || !Number.isInteger(valor) || valor <= 0) {
      throw new BadRequestError(`${campo} debe ser un entero positivo`);
    }
    return valor;
  }

  private nombreProfesional(p: { nombre: string; apellido: string }): string {
    return `${p.apellido}, ${p.nombre}`;
  }

  private toDto(o: OcupacionConsultorio, h: Habitacion): OcupacionDto {
    return {
      id: o.id,
      profesionalId: o.profesionalId,
      habitacionId: o.habitacionId,
      habitacion: { numero: h.numero, piso: h.piso, sector: h.sector },
      iniciadaEn: o.iniciadaEn.toISOString(),
    };
  }

  /** Consultorios del hospital con su ocupación actual. */
  async listarConsultorios(): Promise<ConsultorioEstadoDto[]> {
    const [habitaciones, activas] = await Promise.all([
      this.habitaciones.findAll(),
      this.ocupaciones.findActivas(),
    ]);
    const porHabitacion = new Map(activas.map((o) => [o.habitacionId, o]));

    const consultorios = habitaciones.filter((h) => h.tipo === 'CONSULTORIO');
    return Promise.all(
      consultorios.map(async (h) => {
        const o = porHabitacion.get(h.id);
        let ocupacion: ConsultorioEstadoDto['ocupacion'] = null;
        if (o) {
          const p = await this.profesionales.findById(o.profesionalId);
          ocupacion = {
            ocupacionId: o.id,
            profesionalId: o.profesionalId,
            profesionalNombre: p ? this.nombreProfesional(p) : `Profesional #${o.profesionalId}`,
            iniciadaEn: o.iniciadaEn.toISOString(),
          };
        }
        return { id: h.id, numero: h.numero, piso: h.piso, sector: h.sector, ocupacion };
      }),
    );
  }

  /** Consultorio que el profesional ocupa ahora (null si no abrió ninguno). */
  async actual(profesionalId: number): Promise<OcupacionDto | null> {
    this.exigirId(profesionalId, 'profesionalId');
    const o = await this.ocupaciones.findActivaByProfesional(profesionalId);
    if (!o) return null;
    const h = await this.habitaciones.findById(o.habitacionId);
    return h ? this.toDto(o, h) : null;
  }

  async abrir(dto: AbrirConsultorioDto): Promise<OcupacionDto> {
    const profesionalId = this.exigirId(dto?.profesionalId, 'profesionalId');
    const habitacionId = this.exigirId(dto?.habitacionId, 'habitacionId');

    const profesional = await this.profesionales.findById(profesionalId);
    if (!profesional) throw new NotFoundError('Profesional not found');
    if (profesional.estado !== 'activo') {
      throw new ConflictError('El profesional no está activo');
    }

    const habitacion = await this.habitaciones.findById(habitacionId);
    if (!habitacion) throw new NotFoundError('Habitación no encontrada');
    if (habitacion.tipo !== 'CONSULTORIO') {
      throw new ConflictError(
        `La habitación ${habitacion.numero} es de internación, no un consultorio`,
      );
    }

    // Mensajes claros; la garantía real contra la carrera es el índice único parcial.
    const propia = await this.ocupaciones.findActivaByProfesional(profesionalId);
    if (propia) {
      const h = await this.habitaciones.findById(propia.habitacionId);
      throw new ConflictError(
        `El profesional ya tiene abierto el consultorio ${h?.numero ?? propia.habitacionId}: cerralo antes de abrir otro`,
      );
    }
    const ocupante = await this.ocupaciones.findActivaByHabitacion(habitacionId);
    if (ocupante) {
      const p = await this.profesionales.findById(ocupante.profesionalId);
      throw new ConflictError(
        `El consultorio ${habitacion.numero} está ocupado por ${p ? this.nombreProfesional(p) : `el profesional #${ocupante.profesionalId}`}`,
      );
    }

    const ocupacion = await this.ocupaciones.abrir(habitacionId, profesionalId);
    this.bus.publish(DomainEvents.CONSULTORIO_OCUPADO, {
      ocupacionId: ocupacion.id,
      habitacionId,
      profesionalId,
      timestamp: new Date(),
    });
    return this.toDto(ocupacion, habitacion);
  }

  /** Cierra el consultorio que el profesional tiene abierto y lo deja libre. */
  async cerrar(profesionalId: number): Promise<OcupacionDto> {
    this.exigirId(profesionalId, 'profesionalId');
    const activa = await this.ocupaciones.findActivaByProfesional(profesionalId);
    if (!activa) throw new ConflictError('El profesional no tiene un consultorio abierto');

    const cerrada = await this.ocupaciones.finalizar(activa.id);
    if (!cerrada) throw new ConflictError('El consultorio ya estaba cerrado');

    this.bus.publish(DomainEvents.CONSULTORIO_LIBERADO, {
      ocupacionId: activa.id,
      habitacionId: activa.habitacionId,
      profesionalId,
      timestamp: new Date(),
    });

    const h = (await this.habitaciones.findById(activa.habitacionId))!;
    return this.toDto({ ...activa, estado: 'finalizada', finalizadaEn: new Date() }, h);
  }
}
