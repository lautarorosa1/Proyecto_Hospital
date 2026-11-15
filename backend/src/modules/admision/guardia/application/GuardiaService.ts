import { IGuardiaService } from './IGuardiaService';
import type { IIngresoGuardiaRepository } from '../domain/IIngresoGuardiaRepository';
import type { IGuardiaNotificador } from '../domain/IGuardiaNotificador';
import type { IngresoGuardia } from '../domain/IngresoGuardia';
import { esNivelTriaje, etiquetaDe, prioridadDe } from '../domain/NivelTriaje';
import type { IPacienteRepository } from '../../pacientes/domain/IPacienteRepository';
import type { IProfesionalRepository } from '../../profesionales/domain/IProfesionalRepository';
import { RegistrarIngresoDto } from './dtos/RegistrarIngresoDto';
import {
  ResponseIngresoDto,
  ResponseRegistroIngresoDto,
} from './dtos/ResponseIngresoDto';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../../../../shared/errors';

const MOTIVO_MAX = 500;
const OBSERVACIONES_MAX = 2000;

export class GuardiaService implements IGuardiaService {
  constructor(
    private readonly ingresoRepository: IIngresoGuardiaRepository,
    private readonly pacienteRepository: IPacienteRepository,
    private readonly profesionalRepository: IProfesionalRepository,
    private readonly notificador: IGuardiaNotificador,
  ) {}

  // ---------- Mapeos ----------

  private toDto(ingreso: IngresoGuardia, posicion?: number): ResponseIngresoDto {
    return {
      id: ingreso.id,
      pacienteId: ingreso.pacienteId,
      enfermeroId: ingreso.enfermeroId,
      nivelTriaje: ingreso.nivelTriaje,
      etiquetaNivel: etiquetaDe(ingreso.nivelTriaje),
      prioridad: ingreso.prioridad,
      motivoConsulta: ingreso.motivoConsulta,
      observaciones: ingreso.observaciones,
      estado: ingreso.estado,
      ingresadoEn: ingreso.ingresadoEn.toISOString(),
      posicion,
    };
  }

  // ---------- Validaciones ----------

  private validarId(valor: unknown, campo: string): number {
    if (typeof valor !== 'number' || !Number.isInteger(valor) || valor <= 0) {
      throw new BadRequestError(`${campo} debe ser un entero positivo`);
    }
    return valor;
  }

  private validarTexto(valor: unknown, campo: string, max: number): string {
    if (typeof valor !== 'string' || !valor.trim()) {
      throw new BadRequestError(`${campo} es obligatorio`);
    }
    if (valor.trim().length > max) {
      throw new BadRequestError(`${campo} no puede superar los ${max} caracteres`);
    }
    return valor.trim();
  }

  // ---------- Casos de uso ----------

  async registrarIngreso(
    dto: RegistrarIngresoDto,
  ): Promise<ResponseRegistroIngresoDto> {
    const body = (dto ?? {}) as Partial<RegistrarIngresoDto>;

    const pacienteId = this.validarId(body.pacienteId, 'pacienteId');
    const enfermeroId = this.validarId(body.enfermeroId, 'enfermeroId');
    if (!esNivelTriaje(body.nivelTriaje)) {
      throw new BadRequestError(
        'nivelTriaje debe ser uno de: rojo, naranja, amarillo, verde, azul',
      );
    }
    const nivelTriaje = body.nivelTriaje;
    const motivoConsulta = this.validarTexto(
      body.motivoConsulta,
      'motivoConsulta',
      MOTIVO_MAX,
    );
    let observaciones: string | undefined;
    if (body.observaciones !== undefined && body.observaciones !== null) {
      observaciones = this.validarTexto(
        body.observaciones,
        'observaciones',
        OBSERVACIONES_MAX,
      );
    }

    const paciente = await this.pacienteRepository.findById(pacienteId);
    if (!paciente) throw new NotFoundError('Paciente no encontrado');
    if (!paciente.activo) throw new ConflictError('El paciente está dado de baja');

    const enfermero = await this.profesionalRepository.findById(enfermeroId);
    if (!enfermero) throw new NotFoundError('Enfermero no encontrado');
    if (enfermero.tipoProfesional !== 'enfermero') {
      throw new BadRequestError(
        'Solo un profesional de tipo enfermero puede clasificar el triaje',
      );
    }
    if (enfermero.estado !== 'activo') {
      throw new ConflictError(
        `El enfermero no está activo (estado: ${enfermero.estado})`,
      );
    }

    if (await this.ingresoRepository.findActivoByPaciente(pacienteId)) {
      throw new ConflictError('El paciente ya está registrado en la guardia');
    }

    let ingreso: IngresoGuardia;
    try {
      ingreso = await this.ingresoRepository.create({
        pacienteId,
        enfermeroId,
        nivelTriaje,
        prioridad: prioridadDe(nivelTriaje),
        motivoConsulta,
        observaciones,
      });
    } catch (err) {
      // Dos registros simultáneos del mismo paciente: gana uno, el otro rebota
      // contra el índice único parcial de la base.
      const code = (err as { driverError?: { code?: string } })?.driverError?.code;
      if (code === '23505') {
        throw new ConflictError('El paciente ya está registrado en la guardia');
      }
      throw err;
    }

    // La posición no se "inserta": sale del orden (prioridad, llegada). Un
    // Riesgo Vital pasa delante de todos los de menor nivel sin mover a nadie.
    const cola = await this.ingresoRepository.findCola();
    const indice = cola.findIndex((i) => i.id === ingreso.id);
    const desplazados = cola.filter((i) => i.prioridad > ingreso.prioridad).length;

    const medicosAlertados =
      nivelTriaje === 'rojo' ? await this.alertarRiesgoVital(ingreso, paciente) : [];

    return {
      ingreso: this.toDto(ingreso, indice >= 0 ? indice + 1 : undefined),
      desplazados,
      medicosAlertados,
    };
  }

  /**
   * Alerta a los médicos de guardia disponibles (tipo médico y activo). Un fallo
   * al notificar no deshace el ingreso: el paciente ya está en la cola.
   */
  private async alertarRiesgoVital(
    ingreso: IngresoGuardia,
    paciente: Parameters<IGuardiaNotificador['alertaRiesgoVital']>[1],
  ): Promise<number[]> {
    try {
      const medicos = await this.profesionalRepository.findAll({
        tipoProfesional: 'medico',
        estado: 'activo',
      });
      const ids = medicos.map((m) => m.id);
      if (ids.length === 0) {
        console.warn(
          `[Guardia] Riesgo Vital (ingreso ${ingreso.id}) sin médicos activos para alertar`,
        );
      }
      await this.notificador.alertaRiesgoVital(ingreso, paciente, ids);
      return ids;
    } catch (err) {
      console.error('[Guardia] No se pudo emitir la alerta de Riesgo Vital', err);
      return [];
    }
  }

  async getIngreso(id: number): Promise<ResponseIngresoDto> {
    this.validarId(id, 'El id');
    const ingreso = await this.ingresoRepository.findById(id);
    if (!ingreso) throw new NotFoundError('Ingreso no encontrado');

    let posicion: number | undefined;
    if (ingreso.estado === 'en_espera') {
      const cola = await this.ingresoRepository.findCola();
      const indice = cola.findIndex((i) => i.id === ingreso.id);
      posicion = indice >= 0 ? indice + 1 : undefined;
    }
    return this.toDto(ingreso, posicion);
  }

  async getCola(): Promise<ResponseIngresoDto[]> {
    const cola = await this.ingresoRepository.findCola();
    return cola.map((ingreso, i) => this.toDto(ingreso, i + 1));
  }
}
