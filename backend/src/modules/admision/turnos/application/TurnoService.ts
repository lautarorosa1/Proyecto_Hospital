import { ITurnoService } from './ITurnoService';
import { FiltrosTurno, ITurnoRepository } from '../domain/ITurnoRepository';
import { ESTADOS_TURNO, Turno, esEstadoTurno } from '../domain/Turno';
import {
  ENTRETURNO_DURACION_DEFAULT_MIN,
  ENTRETURNO_DURACION_MAX,
  ENTRETURNO_DURACION_MIN,
  advertenciaDeAjuste,
  planificarEntreturno,
} from '../domain/Entreturno';
import { EstadoTurnoState, estadoDe } from '../domain/EstadoTurnoState';
import type { ITurnoNotificador } from '../domain/ITurnoNotificador';
import {
  NOMBRES_DIAS,
  ahoraLocal,
  calcularHoraFin,
  diaSemanaISO,
  esFechaValida,
  esHoraValida,
  esPasado,
  horaAMinutos,
} from '../domain/horario';
import type { IProfesionalRepository } from '../../profesionales/domain/IProfesionalRepository';
import type { IPacienteRepository } from '../../pacientes/domain/IPacienteRepository';
import type { IHorarioRepository } from '../../horarios/domain/IHorarioRepository';
import { CrearTurnoDto } from './dtos/CrearTurnoDto';
import { ReservarTurnoDto } from './dtos/ReservarTurnoDto';
import { FiltrosTurnoDto } from './dtos/FiltrosTurnoDto';
import { ResponseTurnoDto } from './dtos/ResponseTurnoDto';
import { CrearEntreturnoDto } from './dtos/CrearEntreturnoDto';
import { ResponseEntreturnoDto } from './dtos/ResponseEntreturnoDto';
import {
  BadRequestError,
  NotFoundError,
  ConflictError,
} from '../../../../shared/errors';

export class TurnoService implements ITurnoService {
  constructor(
    private readonly turnoRepository: ITurnoRepository,
    private readonly profesionalRepository: IProfesionalRepository,
    private readonly pacienteRepository: IPacienteRepository,
    private readonly horarioRepository: IHorarioRepository,
    private readonly notificador: ITurnoNotificador,
  ) {}

  // ---------- Mapeos ----------

  private toDto(turno: Turno): ResponseTurnoDto {
    const reducido =
      turno.duracionOriginalMin !== undefined &&
      turno.duracionMin < turno.duracionOriginalMin;

    return {
      id: turno.id,
      profesionalId: turno.profesionalId,
      pacienteId: turno.pacienteId,
      fecha: turno.fecha,
      horaInicio: turno.horaInicio,
      horaFin: calcularHoraFin(turno.horaInicio, turno.duracionMin),
      duracionMin: turno.duracionMin,
      estado: turno.estado,
      version: turno.version,
      esEntreturno: turno.esEntreturno,
      reducido,
      duracionOriginalMin: reducido ? turno.duracionOriginalMin : undefined,
      reducidoPorEntreturnoId: reducido
        ? turno.reducidoPorEntreturnoId
        : undefined,
      advertencia: reducido
        ? `Duración reducida de ${turno.duracionOriginalMin} a ${turno.duracionMin} min por un entreturno`
        : undefined,
    };
  }

  /**
   * Rangos de atención del profesional para una fecha. Lanza el error
   * correspondiente si no tiene agenda o no atiende ese día.
   */
  private async rangosDeAtencion(profesionalId: number, fecha: string) {
    const diaSemana = diaSemanaISO(fecha);
    const rangosDelDia = await this.horarioRepository.findByProfesionalYDia(
      profesionalId,
      diaSemana,
    );
    if (rangosDelDia.length === 0) {
      const agenda = await this.horarioRepository.findByProfesional(profesionalId);
      if (agenda.length === 0) {
        throw new ConflictError(
          'El profesional no tiene horarios de atención cargados',
        );
      }
      throw new BadRequestError(
        `El profesional no atiende ese día (${NOMBRES_DIAS[diaSemana - 1]})`,
      );
    }
    return rangosDelDia;
  }

  // ---------- Validaciones ----------

  private validarId(valor: unknown, campo: string): void {
    if (typeof valor !== 'number' || !Number.isInteger(valor) || valor <= 0) {
      throw new BadRequestError(`${campo} debe ser un entero positivo`);
    }
  }

  private validarFecha(valor: unknown, campo: string): void {
    if (typeof valor !== 'string' || !esFechaValida(valor)) {
      throw new BadRequestError(`${campo} debe tener formato YYYY-MM-DD`);
    }
  }

  private validarHora(valor: unknown, campo: string): void {
    if (typeof valor !== 'string' || !esHoraValida(valor)) {
      throw new BadRequestError(`${campo} debe tener formato HH:mm`);
    }
  }

  /** Valida y convierte los filtros del listado (sin tocar el estado). */
  private armarFiltros(filtros: FiltrosTurnoDto): FiltrosTurno {
    const where: FiltrosTurno = {};

    if (filtros.profesionalId !== undefined) {
      this.validarId(filtros.profesionalId, 'profesionalId');
      where.profesionalId = filtros.profesionalId;
    }
    if (filtros.pacienteId !== undefined) {
      this.validarId(filtros.pacienteId, 'pacienteId');
      where.pacienteId = filtros.pacienteId;
    }
    if (filtros.fecha !== undefined) {
      this.validarFecha(filtros.fecha, 'fecha');
      where.fecha = filtros.fecha;
    }
    if (filtros.fechaDesde !== undefined) {
      this.validarFecha(filtros.fechaDesde, 'fechaDesde');
      where.fechaDesde = filtros.fechaDesde;
    }
    if (filtros.fechaHasta !== undefined) {
      this.validarFecha(filtros.fechaHasta, 'fechaHasta');
      where.fechaHasta = filtros.fechaHasta;
    }
    if (filtros.estado !== undefined) {
      if (!esEstadoTurno(filtros.estado)) {
        throw new BadRequestError(
          `El estado no es válido. Valores permitidos: ${ESTADOS_TURNO.join(', ')}`,
        );
      }
      where.estado = filtros.estado;
    }

    return where;
  }

  // ---------- Casos de uso ----------

  async getAll(filtros: FiltrosTurnoDto = {}): Promise<ResponseTurnoDto[]> {
    const turnos = await this.turnoRepository.findAll(this.armarFiltros(filtros));
    return turnos.map((t) => this.toDto(t));
  }

  /** Slots libres a partir de este momento (HU 1.1: listar disponibles). */
  async getDisponibles(
    filtros: FiltrosTurnoDto = {},
  ): Promise<ResponseTurnoDto[]> {
    const where = this.armarFiltros({ ...filtros, estado: undefined });
    where.estado = 'disponible';
    where.desde = ahoraLocal();

    const turnos = await this.turnoRepository.findAll(where);
    return turnos.map((t) => this.toDto(t));
  }

  async getById(id: number): Promise<ResponseTurnoDto> {
    const turno = await this.turnoRepository.findById(id);
    if (!turno) throw new NotFoundError('Turno not found');
    return this.toDto(turno);
  }

  /**
   * Crea un turno disponible para un profesional en una fecha y hora.
   * La duración la toma del profesional (duracionTurnoMin).
   */
  async crear(dto: CrearTurnoDto): Promise<ResponseTurnoDto> {
    this.validarId(dto.profesionalId, 'profesionalId');
    this.validarFecha(dto.fecha, 'fecha');
    this.validarHora(dto.horaInicio, 'horaInicio');

    if (esPasado(dto.fecha, dto.horaInicio)) {
      throw new BadRequestError(
        'No se puede crear un turno en un horario que ya pasó',
      );
    }

    const profesional = await this.profesionalRepository.findById(
      dto.profesionalId,
    );
    if (!profesional) throw new NotFoundError('Profesional not found');
    if (profesional.estado !== 'activo') {
      throw new ConflictError('El profesional no está activo');
    }

    const duracionMin = profesional.duracionTurnoMin;
    const inicio = horaAMinutos(dto.horaInicio);
    const fin = inicio + duracionMin;

    // El turno debe caer en la grilla de atención del profesional: dentro de
    // uno de sus rangos del día, empezando en el inicio del rango o a
    // múltiplos de la duración del turno a partir de ahí.
    const diaSemana = diaSemanaISO(dto.fecha);
    const rangosDelDia = await this.rangosDeAtencion(
      dto.profesionalId,
      dto.fecha,
    );

    const enGrilla = rangosDelDia.some((r) => {
      const desde = horaAMinutos(r.horaDesde);
      const hasta = horaAMinutos(r.horaHasta);
      return inicio >= desde && fin <= hasta && (inicio - desde) % duracionMin === 0;
    });
    if (!enGrilla) {
      const rangos = rangosDelDia
        .map((r) => `${r.horaDesde}–${r.horaHasta}`)
        .join(', ');
      throw new BadRequestError(
        `El horario no coincide con la atención del profesional (${NOMBRES_DIAS[diaSemana - 1]}: ${rangos}, turnos de ${duracionMin} min)`,
      );
    }

    // No se permite pisar turnos existentes (no cancelados) del profesional.
    const existentes = await this.turnoRepository.findActivosByProfesionalYFecha(
      dto.profesionalId,
      dto.fecha,
    );
    const haySolapamiento = existentes.some((t) => {
      const tInicio = horaAMinutos(t.horaInicio);
      const tFin = tInicio + t.duracionMin;
      return tInicio < fin && tFin > inicio;
    });
    if (haySolapamiento) {
      throw new ConflictError(
        'El profesional ya tiene un turno que se superpone con ese horario',
      );
    }

    const creado = await this.turnoRepository.create({
      profesionalId: dto.profesionalId,
      fecha: dto.fecha,
      horaInicio: dto.horaInicio,
      duracionMin,
      estado: 'disponible',
    });

    return this.toDto(creado);
  }

  /**
   * HU 1.2. Inserta un entreturno para un paciente de urgencia menor.
   * Los turnos que se superponen se recortan (mismo ID, menos duración) y se
   * marcan como reducidos; el entreturno es un registro nuevo. Todo ocurre en
   * una transacción con lock por profesional y fecha.
   */
  async crearEntreturno(dto: CrearEntreturnoDto): Promise<ResponseEntreturnoDto> {
    this.validarId(dto.profesionalId, 'profesionalId');
    this.validarId(dto.pacienteId, 'pacienteId');
    this.validarFecha(dto.fecha, 'fecha');
    this.validarHora(dto.horaInicio, 'horaInicio');

    const duracionMin = dto.duracionMin ?? ENTRETURNO_DURACION_DEFAULT_MIN;
    if (
      typeof duracionMin !== 'number' ||
      !Number.isInteger(duracionMin) ||
      duracionMin < ENTRETURNO_DURACION_MIN ||
      duracionMin > ENTRETURNO_DURACION_MAX
    ) {
      throw new BadRequestError(
        `duracionMin debe ser un entero entre ${ENTRETURNO_DURACION_MIN} y ${ENTRETURNO_DURACION_MAX}`,
      );
    }

    if (esPasado(dto.fecha, dto.horaInicio)) {
      throw new BadRequestError(
        'No se puede crear un entreturno en un horario que ya pasó',
      );
    }

    const profesional = await this.profesionalRepository.findById(
      dto.profesionalId,
    );
    if (!profesional) throw new NotFoundError('Profesional not found');
    if (profesional.estado !== 'activo') {
      throw new ConflictError('El profesional no está activo');
    }

    const paciente = await this.pacienteRepository.findById(dto.pacienteId);
    if (!paciente) throw new NotFoundError('Paciente not found');

    // El entreturno no necesita caer en la grilla, pero sí dentro de un
    // mismo rango de atención del profesional.
    const inicio = horaAMinutos(dto.horaInicio);
    const fin = inicio + duracionMin;
    const rangos = await this.rangosDeAtencion(dto.profesionalId, dto.fecha);
    const dentroDeAtencion = rangos.some(
      (r) => inicio >= horaAMinutos(r.horaDesde) && fin <= horaAMinutos(r.horaHasta),
    );
    if (!dentroDeAtencion) {
      const txt = rangos.map((r) => `${r.horaDesde}–${r.horaHasta}`).join(', ');
      throw new BadRequestError(
        `El entreturno (${dto.horaInicio}–${calcularHoraFin(dto.horaInicio, duracionMin)}) debe estar dentro de la atención del profesional (${txt})`,
      );
    }

    // La validación real se hace dentro de la transacción, sobre la agenda
    // ya bloqueada (lo anterior es solo para fallar rápido).
    const { entreturno, afectados } =
      await this.turnoRepository.insertarEntreturno(
        {
          profesionalId: dto.profesionalId,
          pacienteId: dto.pacienteId,
          fecha: dto.fecha,
          horaInicio: dto.horaInicio,
          duracionMin,
          estado: 'programado',
        },
        (activos) => planificarEntreturno(activos, dto.horaInicio, duracionMin),
      );

    // Los cambios ya están confirmados: si el aviso falla no se revierten.
    try {
      await this.notificador.turnosReducidosPorEntreturno(entreturno, afectados);
    } catch (err) {
      console.error('No se pudo notificar la reducción de turnos', err);
    }

    return {
      entreturno: this.toDto(entreturno),
      afectados: afectados.map((a) => this.toDto(a.despues)),
      advertencias: afectados.map(advertenciaDeAjuste),
    };
  }

  /**
   * Reserva un turno disponible para un paciente.
   * El cliente debe enviar la `version` que vio al listar: si otro usuario
   * reservó o modificó el turno en el medio, se responde 409.
   */
  async reservar(
    id: number,
    dto: ReservarTurnoDto,
  ): Promise<ResponseTurnoDto> {
    this.validarId(dto.pacienteId, 'pacienteId');
    this.validarId(dto.version, 'version');

    const turno = await this.turnoRepository.findById(id);
    if (!turno) throw new NotFoundError('Turno not found');

    if (turno.estado !== 'disponible') {
      throw new ConflictError(
        'El turno acaba de ser ocupado por otro usuario. Actualizá la lista y elegí otro horario',
      );
    }
    if (turno.version !== dto.version) {
      throw new ConflictError(
        'El turno fue modificado por otro usuario. Actualizá la lista y volvé a intentar',
      );
    }
    if (esPasado(turno.fecha, turno.horaInicio)) {
      throw new BadRequestError('No se puede reservar un turno que ya pasó');
    }

    const paciente = await this.pacienteRepository.findById(dto.pacienteId);
    if (!paciente) throw new NotFoundError('Paciente not found');

    const profesional = await this.profesionalRepository.findById(
      turno.profesionalId,
    );
    if (!profesional || profesional.estado !== 'activo') {
      throw new ConflictError(
        'El profesional no está disponible para recibir turnos',
      );
    }

    // La verificación real contra carreras: UPDATE ... WHERE id AND version.
    const reservado = await this.turnoRepository.reservar(
      id,
      dto.version,
      dto.pacienteId,
    );
    if (!reservado) {
      throw new ConflictError(
        'El turno acaba de ser ocupado por otro usuario. Actualizá la lista y elegí otro horario',
      );
    }

    const actualizado = await this.turnoRepository.findById(id);
    if (!actualizado) throw new NotFoundError('Turno not found');
    return this.toDto(actualizado);
  }

  // ---------- Transiciones de estado (patrón State, HU 2.1) ----------

  /**
   * Aplica una transición: el State actual decide el estado siguiente (o
   * rechaza la acción), y el cambio se persiste con compare-and-set para que
   * dos usuarios no pisen el mismo turno.
   */
  private async transicionar(
    id: number,
    accion: (estado: EstadoTurnoState) => Turno['estado'],
  ): Promise<Turno> {
    const turno = await this.turnoRepository.findById(id);
    if (!turno) throw new NotFoundError('Turno not found');

    const siguiente = accion(estadoDe(turno.estado));

    const cambiado = await this.turnoRepository.cambiarEstado(
      id,
      turno.estado,
      siguiente,
    );
    if (!cambiado) {
      throw new ConflictError(
        'El turno cambió de estado mientras se procesaba la acción. Actualizá y volvé a intentar',
      );
    }

    const actualizado = await this.turnoRepository.findById(id);
    if (!actualizado) throw new NotFoundError('Turno not found');
    return actualizado;
  }

  /** El paciente revalida su asistencia: programado -> confirmado. */
  async confirmar(id: number): Promise<ResponseTurnoDto> {
    const turno = await this.transicionar(id, (e) => e.confirmar());
    return this.toDto(turno);
  }

  /** El paciente se anuncia en recepción: confirmado -> en_sala_espera. */
  async registrarLlegada(id: number): Promise<ResponseTurnoDto> {
    const turno = await this.transicionar(id, (e) => e.registrarLlegada());

    // El estado ya quedó guardado: si el aviso falla no se revierte la llegada.
    try {
      await this.notificador.pacienteEnSalaDeEspera(turno);
    } catch (err) {
      console.error('No se pudo notificar al consultorio', err);
    }

    return this.toDto(turno);
  }

  /** Concluye la consulta: en_sala_espera -> atendido. */
  async atender(id: number): Promise<ResponseTurnoDto> {
    const turno = await this.transicionar(id, (e) => e.atender());
    return this.toDto(turno);
  }

  /**
   * Cancela un turno reservado y libera su horario como un slot nuevo.
   * Punto de extensión: acá se engancha la promoción desde la lista de espera
   * (HU 1.3) usando el slot `liberado`.
   */
  async cancelar(id: number): Promise<ResponseTurnoDto> {
    const turno = await this.turnoRepository.findById(id);
    if (!turno) throw new NotFoundError('Turno not found');

    // El State valida que desde el estado actual se pueda cancelar.
    estadoDe(turno.estado).cancelar();

    const resultado = await this.turnoRepository.cancelarYLiberar(
      id,
      turno.estado,
    );
    if (!resultado) {
      throw new ConflictError(
        'El turno cambió de estado y ya no se puede cancelar',
      );
    }

    return this.toDto(resultado.cancelado);
  }
}
