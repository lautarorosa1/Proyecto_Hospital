import { IProfesionalService } from './IProfesionalService';
import {
  FiltrosProfesional,
  IProfesionalRepository,
} from '../domain/IProfesionalRepository';
import {
  DURACION_TURNO_DEFAULT,
  DURACION_TURNO_MAX,
  DURACION_TURNO_MIN,
  ESTADOS_PROFESIONAL,
  TIPOS_PROFESIONAL,
  Profesional,
  esEstadoProfesional,
  esTipoProfesional,
} from '../domain/Profesional';
import { CreateProfesionalDto } from './dtos/CreateProfesionalDto';
import { UpdateProfesionalDto } from './dtos/UpdateProfesionalDto';
import { ResponseProfesionalDto } from './dtos/ResponseProfesionalDto';
import { FiltrosProfesionalDto } from './dtos/FiltrosProfesionalDto';
import {
  BadRequestError,
  NotFoundError,
  ConflictError,
} from '../../../../shared/errors';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DNI_REGEX = /^\d{7,9}$/;

type ProfesionalData = Omit<Profesional, 'id'>;

export class ProfesionalService implements IProfesionalService {
  constructor(private readonly profesionalRepository: IProfesionalRepository) {}

  // ---------- Mapeos ----------

  private toDto(profesional: Profesional): ResponseProfesionalDto {
    return {
      id: profesional.id,
      usuarioId: profesional.usuarioId,
      especialidadId: profesional.especialidadId,
      nombre: profesional.nombre,
      apellido: profesional.apellido,
      dni: profesional.dni,
      email: profesional.email,
      telefono: profesional.telefono,
      matricula: profesional.matricula,
      tipoProfesional: profesional.tipoProfesional,
      duracionTurnoMin: profesional.duracionTurnoMin,
      estado: profesional.estado,
    };
  }

  private toNewProfesional(dto: CreateProfesionalDto): ProfesionalData {
    return {
      usuarioId: dto.usuarioId,
      especialidadId: dto.especialidadId,
      nombre: dto.nombre.trim(),
      apellido: dto.apellido.trim(),
      dni: dto.dni.trim(),
      email: dto.email.trim().toLowerCase(),
      telefono: dto.telefono?.trim(),
      matricula: dto.matricula.trim(),
      tipoProfesional: dto.tipoProfesional,
      duracionTurnoMin: dto.duracionTurnoMin ?? DURACION_TURNO_DEFAULT,
      estado: dto.estado ?? 'activo',
    };
  }

  private toProfesionalChanges(
    dto: UpdateProfesionalDto,
  ): Partial<ProfesionalData> {
    const changes: Partial<ProfesionalData> = {};

    if (dto.usuarioId !== undefined) changes.usuarioId = dto.usuarioId;
    if (dto.especialidadId !== undefined) {
      changes.especialidadId = dto.especialidadId;
    }
    if (dto.nombre !== undefined) changes.nombre = dto.nombre.trim();
    if (dto.apellido !== undefined) changes.apellido = dto.apellido.trim();
    if (dto.dni !== undefined) changes.dni = dto.dni.trim();
    if (dto.email !== undefined) changes.email = dto.email.trim().toLowerCase();
    if (dto.telefono !== undefined) changes.telefono = dto.telefono.trim();
    if (dto.matricula !== undefined) changes.matricula = dto.matricula.trim();
    if (dto.tipoProfesional !== undefined) {
      changes.tipoProfesional = dto.tipoProfesional;
    }
    if (dto.duracionTurnoMin !== undefined) {
      changes.duracionTurnoMin = dto.duracionTurnoMin;
    }
    if (dto.estado !== undefined) changes.estado = dto.estado;

    return changes;
  }

  // ---------- Validaciones ----------

  /** Exige un string no vacío (protege también de tipos incorrectos en runtime). */
  private validarTextoObligatorio(valor: unknown, mensaje: string): void {
    if (typeof valor !== 'string' || !valor.trim()) {
      throw new BadRequestError(mensaje);
    }
  }

  private validarEmail(email: string): void {
    if (!EMAIL_REGEX.test(email.trim())) {
      throw new BadRequestError('El email no es válido');
    }
  }

  private validarDni(dni: string): void {
    if (!DNI_REGEX.test(dni.trim())) {
      throw new BadRequestError('El DNI no es válido');
    }
  }

  private validarIdReferencia(valor: unknown, campo: string): void {
    if (typeof valor !== 'number' || !Number.isInteger(valor) || valor <= 0) {
      throw new BadRequestError(`${campo} debe ser un entero positivo`);
    }
  }

  private validarDuracionTurno(valor: unknown): void {
    if (
      typeof valor !== 'number' ||
      !Number.isInteger(valor) ||
      valor < DURACION_TURNO_MIN ||
      valor > DURACION_TURNO_MAX
    ) {
      throw new BadRequestError(
        `La duración del turno debe ser un entero entre ${DURACION_TURNO_MIN} y ${DURACION_TURNO_MAX} minutos`,
      );
    }
  }

  private validarTipo(tipo: unknown): void {
    if (typeof tipo !== 'string' || !esTipoProfesional(tipo)) {
      throw new BadRequestError(
        `El tipo de profesional no es válido. Valores permitidos: ${TIPOS_PROFESIONAL.join(', ')}`,
      );
    }
  }

  private validarEstado(estado: unknown): void {
    if (typeof estado !== 'string' || !esEstadoProfesional(estado)) {
      throw new BadRequestError(
        `El estado no es válido. Valores permitidos: ${ESTADOS_PROFESIONAL.join(', ')}`,
      );
    }
  }

  /**
   * Verifica que DNI, email, matrícula y usuario no pertenezcan a otro profesional.
   * `idActual` se usa en el update para ignorar al propio profesional.
   */
  private async validarUnicidad(
    datos: {
      dni?: string;
      email?: string;
      matricula?: string;
      usuarioId?: number;
    },
    idActual?: number,
  ): Promise<void> {
    if (datos.dni !== undefined) {
      const existente = await this.profesionalRepository.findByDni(
        datos.dni.trim(),
      );
      if (existente && existente.id !== idActual) {
        throw new ConflictError('Ya existe un profesional con ese DNI');
      }
    }
    if (datos.email !== undefined) {
      const existente = await this.profesionalRepository.findByEmail(
        datos.email.trim().toLowerCase(),
      );
      if (existente && existente.id !== idActual) {
        throw new ConflictError('Ya existe un profesional con ese email');
      }
    }
    if (datos.matricula !== undefined) {
      const existente = await this.profesionalRepository.findByMatricula(
        datos.matricula.trim(),
      );
      if (existente && existente.id !== idActual) {
        throw new ConflictError('Ya existe un profesional con esa matrícula');
      }
    }
    if (datos.usuarioId !== undefined) {
      const existente = await this.profesionalRepository.findByUsuarioId(
        datos.usuarioId,
      );
      if (existente && existente.id !== idActual) {
        throw new ConflictError(
          'Ya existe un profesional vinculado a ese usuario',
        );
      }
    }
  }

  // ---------- Casos de uso ----------

  async getAll(
    filtros: FiltrosProfesionalDto = {},
  ): Promise<ResponseProfesionalDto[]> {
    const where: FiltrosProfesional = {};

    if (filtros.estado !== undefined) {
      this.validarEstado(filtros.estado);
      where.estado = filtros.estado as FiltrosProfesional['estado'];
    }
    if (filtros.tipoProfesional !== undefined) {
      this.validarTipo(filtros.tipoProfesional);
      where.tipoProfesional =
        filtros.tipoProfesional as FiltrosProfesional['tipoProfesional'];
    }
    if (filtros.especialidadId !== undefined) {
      this.validarIdReferencia(filtros.especialidadId, 'especialidadId');
      where.especialidadId = filtros.especialidadId;
    }

    const profesionales = await this.profesionalRepository.findAll(where);
    return profesionales.map((p) => this.toDto(p));
  }

  async getById(id: number): Promise<ResponseProfesionalDto> {
    const profesional = await this.profesionalRepository.findById(id);
    if (!profesional) throw new NotFoundError('Profesional not found');
    return this.toDto(profesional);
  }

  async create(dto: CreateProfesionalDto): Promise<ResponseProfesionalDto> {
    if (dto.usuarioId === undefined || dto.usuarioId === null) {
      throw new BadRequestError('El usuario es obligatorio');
    }
    if (dto.especialidadId === undefined || dto.especialidadId === null) {
      throw new BadRequestError('La especialidad es obligatoria');
    }
    this.validarTextoObligatorio(dto.nombre, 'El nombre es obligatorio');
    this.validarTextoObligatorio(dto.apellido, 'El apellido es obligatorio');
    this.validarTextoObligatorio(dto.dni, 'El DNI es obligatorio');
    this.validarTextoObligatorio(dto.email, 'El email es obligatorio');
    this.validarTextoObligatorio(dto.matricula, 'La matrícula es obligatoria');
    if (!dto.tipoProfesional) {
      throw new BadRequestError('El tipo de profesional es obligatorio');
    }

    this.validarIdReferencia(dto.usuarioId, 'usuarioId');
    this.validarIdReferencia(dto.especialidadId, 'especialidadId');
    this.validarDni(dto.dni);
    this.validarEmail(dto.email);
    this.validarTipo(dto.tipoProfesional);
    if (dto.duracionTurnoMin !== undefined) {
      this.validarDuracionTurno(dto.duracionTurnoMin);
    }
    if (dto.estado !== undefined) this.validarEstado(dto.estado);

    await this.validarUnicidad({
      dni: dto.dni,
      email: dto.email,
      matricula: dto.matricula,
      usuarioId: dto.usuarioId,
    });

    const profesional = await this.profesionalRepository.create(
      this.toNewProfesional(dto),
    );

    return this.toDto(profesional);
  }

  async update(
    id: number,
    dto: UpdateProfesionalDto,
  ): Promise<ResponseProfesionalDto> {
    if (dto.usuarioId !== undefined) {
      this.validarIdReferencia(dto.usuarioId, 'usuarioId');
    }
    if (dto.especialidadId !== undefined) {
      this.validarIdReferencia(dto.especialidadId, 'especialidadId');
    }
    if (dto.nombre !== undefined) {
      this.validarTextoObligatorio(dto.nombre, 'El nombre no puede estar vacío');
    }
    if (dto.apellido !== undefined) {
      this.validarTextoObligatorio(
        dto.apellido,
        'El apellido no puede estar vacío',
      );
    }
    if (dto.matricula !== undefined) {
      this.validarTextoObligatorio(
        dto.matricula,
        'La matrícula no puede estar vacía',
      );
    }
    if (dto.dni !== undefined) this.validarDni(dto.dni);
    if (dto.email !== undefined) this.validarEmail(dto.email);
    if (dto.tipoProfesional !== undefined) this.validarTipo(dto.tipoProfesional);
    if (dto.duracionTurnoMin !== undefined) {
      this.validarDuracionTurno(dto.duracionTurnoMin);
    }
    if (dto.estado !== undefined) this.validarEstado(dto.estado);

    const existente = await this.profesionalRepository.findById(id);
    if (!existente) throw new NotFoundError('Profesional not found');

    await this.validarUnicidad(
      {
        dni: dto.dni,
        email: dto.email,
        matricula: dto.matricula,
        usuarioId: dto.usuarioId,
      },
      id,
    );

    const updated = await this.profesionalRepository.update(
      id,
      this.toProfesionalChanges(dto),
    );

    if (!updated) throw new NotFoundError('Profesional not found');
    return this.toDto(updated);
  }

  /**
   * Baja lógica: los turnos referencian al profesional, por lo que no se
   * borra la fila; se lo marca como "inactivo" y deja de recibir turnos.
   */
  async remove(id: number): Promise<void> {
    const updated = await this.profesionalRepository.update(id, {
      estado: 'inactivo',
    });
    if (!updated) throw new NotFoundError('Profesional not found');
  }
}
