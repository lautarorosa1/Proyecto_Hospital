import { IHorarioService } from './IHorarioService';
import type { IHorarioRepository } from '../domain/IHorarioRepository';
import type { HorarioProfesional, NuevoHorario } from '../domain/HorarioProfesional';
import type { IProfesionalRepository } from '../../profesionales/domain/IProfesionalRepository';
import {
  NOMBRES_DIAS,
  esHoraValida,
  horaAMinutos,
} from '../../turnos/domain/horario';
import { GuardarHorariosDto } from './dtos/GuardarHorariosDto';
import { ResponseHorarioDto } from './dtos/ResponseHorarioDto';
import { BadRequestError, NotFoundError } from '../../../../shared/errors';

const MAX_RANGOS = 50;

export class HorarioService implements IHorarioService {
  constructor(
    private readonly horarioRepository: IHorarioRepository,
    private readonly profesionalRepository: IProfesionalRepository,
  ) {}

  private toDto(horario: HorarioProfesional): ResponseHorarioDto {
    return {
      id: horario.id,
      profesionalId: horario.profesionalId,
      diaSemana: horario.diaSemana,
      horaDesde: horario.horaDesde,
      horaHasta: horario.horaHasta,
    };
  }

  private validarId(valor: unknown, campo: string): void {
    if (typeof valor !== 'number' || !Number.isInteger(valor) || valor <= 0) {
      throw new BadRequestError(`${campo} debe ser un entero positivo`);
    }
  }

  async getByProfesional(profesionalId: number): Promise<ResponseHorarioDto[]> {
    this.validarId(profesionalId, 'profesionalId');

    const profesional = await this.profesionalRepository.findById(profesionalId);
    if (!profesional) throw new NotFoundError('Profesional not found');

    const horarios = await this.horarioRepository.findByProfesional(profesionalId);
    return horarios.map((h) => this.toDto(h));
  }

  /**
   * Reemplaza la agenda semanal del profesional. Cada rango debe ser válido,
   * entrar al menos un turno completo y no superponerse con otro del mismo día.
   */
  async guardar(
    profesionalId: number,
    dto: GuardarHorariosDto,
  ): Promise<ResponseHorarioDto[]> {
    this.validarId(profesionalId, 'profesionalId');

    if (!dto || !Array.isArray(dto.horarios)) {
      throw new BadRequestError('horarios debe ser un arreglo');
    }
    if (dto.horarios.length > MAX_RANGOS) {
      throw new BadRequestError(`No se pueden cargar más de ${MAX_RANGOS} rangos`);
    }

    const profesional = await this.profesionalRepository.findById(profesionalId);
    if (!profesional) throw new NotFoundError('Profesional not found');

    const nuevos: NuevoHorario[] = dto.horarios.map((h) => {
      if (
        typeof h?.diaSemana !== 'number' ||
        !Number.isInteger(h.diaSemana) ||
        h.diaSemana < 1 ||
        h.diaSemana > 7
      ) {
        throw new BadRequestError(
          'diaSemana debe ser un entero entre 1 (lunes) y 7 (domingo)',
        );
      }
      if (typeof h.horaDesde !== 'string' || !esHoraValida(h.horaDesde)) {
        throw new BadRequestError('horaDesde debe tener formato HH:mm');
      }
      if (typeof h.horaHasta !== 'string' || !esHoraValida(h.horaHasta)) {
        throw new BadRequestError('horaHasta debe tener formato HH:mm');
      }

      const dia = NOMBRES_DIAS[h.diaSemana - 1];
      const desde = horaAMinutos(h.horaDesde);
      const hasta = horaAMinutos(h.horaHasta);

      if (desde >= hasta) {
        throw new BadRequestError(
          `En ${dia}, ${h.horaDesde} debe ser anterior a ${h.horaHasta}`,
        );
      }
      if (hasta - desde < profesional.duracionTurnoMin) {
        throw new BadRequestError(
          `En ${dia}, el rango ${h.horaDesde}–${h.horaHasta} es menor que la duración de un turno (${profesional.duracionTurnoMin} min)`,
        );
      }

      return {
        diaSemana: h.diaSemana,
        horaDesde: h.horaDesde,
        horaHasta: h.horaHasta,
      };
    });

    // Sin superposiciones dentro del mismo día (rangos pegados sí se permiten)
    const ordenados = [...nuevos].sort(
      (a, b) => a.diaSemana - b.diaSemana || a.horaDesde.localeCompare(b.horaDesde),
    );
    for (let i = 1; i < ordenados.length; i++) {
      const anterior = ordenados[i - 1];
      const actual = ordenados[i];
      if (
        anterior.diaSemana === actual.diaSemana &&
        horaAMinutos(actual.horaDesde) < horaAMinutos(anterior.horaHasta)
      ) {
        throw new BadRequestError(
          `Los rangos del ${NOMBRES_DIAS[actual.diaSemana - 1]} se superponen`,
        );
      }
    }

    const guardados = await this.horarioRepository.reemplazar(profesionalId, nuevos);
    return guardados.map((h) => this.toDto(h));
  }
}
