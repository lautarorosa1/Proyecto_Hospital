import { IPacienteService } from './IPacienteService';
import { IPacienteRepository } from '../domain/IPacienteRepository';
import { Paciente } from '../domain/Paciente';
import { CreatePacienteDto } from './dtos/CreatePacienteDto';
import { UpdatePacienteDto } from './dtos/UpdatePacienteDto';
import { ResponsePacienteDto } from './dtos/ResponsePacienteDto';
import {
  BadRequestError,
  NotFoundError,
  ConflictError,
} from '../../../shared/errors';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DNI_REGEX = /^\d{7,9}$/;
const FECHA_ISO_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;

type PacienteData = Omit<Paciente, 'id'>;

export class PacienteService implements IPacienteService {
  constructor(private readonly pacienteRepository: IPacienteRepository) {}

  // ---------- Mapeos ----------

  private toDto(paciente: Paciente): ResponsePacienteDto {
    return {
      id: paciente.id,
      nombre: paciente.nombre,
      apellido: paciente.apellido,
      dni: paciente.dni,
      email: paciente.email,
      fechaNacimiento: paciente.fechaNacimiento,
      telefono: paciente.telefono,
      direccion: paciente.direccion,
    };
  }

  private toNewPaciente(dto: CreatePacienteDto): PacienteData {
    return {
      nombre: dto.nombre.trim(),
      apellido: dto.apellido.trim(),
      dni: dto.dni.trim(),
      email: dto.email.trim().toLowerCase(),
      fechaNacimiento: dto.fechaNacimiento.trim(),
      telefono: dto.telefono?.trim(),
      direccion: dto.direccion?.trim(),
    };
  }

  private toPacienteChanges(dto: UpdatePacienteDto): Partial<PacienteData> {
    const changes: Partial<PacienteData> = {};

    if (dto.nombre !== undefined) changes.nombre = dto.nombre.trim();
    if (dto.apellido !== undefined) changes.apellido = dto.apellido.trim();
    if (dto.dni !== undefined) changes.dni = dto.dni.trim();
    if (dto.email !== undefined) changes.email = dto.email.trim().toLowerCase();
    if (dto.fechaNacimiento !== undefined) {
      changes.fechaNacimiento = dto.fechaNacimiento.trim();
    }
    if (dto.telefono !== undefined) changes.telefono = dto.telefono.trim();
    if (dto.direccion !== undefined) changes.direccion = dto.direccion.trim();

    return changes;
  }

  // ---------- Validaciones ----------

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

  /** Valida formato "YYYY-MM-DD", que la fecha exista y que no sea futura */
  private validarFechaNacimiento(fecha: string): void {
    const match = FECHA_ISO_REGEX.exec(fecha.trim());
    if (!match) {
      throw new BadRequestError(
        'La fecha de nacimiento debe tener formato YYYY-MM-DD',
      );
    }

    const anio = Number(match[1]);
    const mes = Number(match[2]);
    const dia = Number(match[3]);

    const date = new Date(Date.UTC(anio, mes - 1, dia));
    const esReal =
      date.getUTCFullYear() === anio &&
      date.getUTCMonth() === mes - 1 &&
      date.getUTCDate() === dia;

    if (!esReal) {
      throw new BadRequestError('La fecha de nacimiento no es válida');
    }
    if (date.getTime() > Date.now()) {
      throw new BadRequestError('La fecha de nacimiento no puede ser futura');
    }
  }

  /**
   * Verifica que DNI y email no pertenezcan a otro paciente.
   * `idActual` se usa en el update para ignorar al propio paciente.
   */
  private async validarUnicidad(
    dni?: string,
    email?: string,
    idActual?: number,
  ): Promise<void> {
    if (dni !== undefined) {
      const existente = await this.pacienteRepository.findByDni(dni.trim());
      if (existente && existente.id !== idActual) {
        throw new ConflictError('Ya existe un paciente con ese DNI');
      }
    }
    if (email !== undefined) {
      const existente = await this.pacienteRepository.findByEmail(
        email.trim().toLowerCase(),
      );
      if (existente && existente.id !== idActual) {
        throw new ConflictError('Ya existe un paciente con ese email');
      }
    }
  }

  // ---------- Casos de uso ----------

  async getAll(): Promise<ResponsePacienteDto[]> {
    const pacientes = await this.pacienteRepository.findAll();
    return pacientes.map((p) => this.toDto(p));
  }

  async getById(id: number): Promise<ResponsePacienteDto> {
    const paciente = await this.pacienteRepository.findById(id);
    if (!paciente) throw new NotFoundError('Paciente not found');
    return this.toDto(paciente);
  }

  async create(dto: CreatePacienteDto): Promise<ResponsePacienteDto> {
    if (!dto.nombre?.trim()) throw new BadRequestError('El nombre es obligatorio');
    if (!dto.apellido?.trim()) throw new BadRequestError('El apellido es obligatorio');
    if (!dto.dni) throw new BadRequestError('El DNI es obligatorio');
    if (!dto.email) throw new BadRequestError('El email es obligatorio');
    if (!dto.fechaNacimiento) {
      throw new BadRequestError('La fecha de nacimiento es obligatoria');
    }

    this.validarDni(dto.dni);
    this.validarEmail(dto.email);
    this.validarFechaNacimiento(dto.fechaNacimiento);
    await this.validarUnicidad(dto.dni, dto.email);

    const paciente = await this.pacienteRepository.create(
      this.toNewPaciente(dto),
    );

    return this.toDto(paciente);
  }

  async update(id: number, dto: UpdatePacienteDto): Promise<ResponsePacienteDto> {
    if (dto.nombre !== undefined && !dto.nombre.trim()) {
      throw new BadRequestError('El nombre no puede estar vacío');
    }
    if (dto.apellido !== undefined && !dto.apellido.trim()) {
      throw new BadRequestError('El apellido no puede estar vacío');
    }
    if (dto.dni !== undefined) this.validarDni(dto.dni);
    if (dto.email !== undefined) this.validarEmail(dto.email);
    if (dto.fechaNacimiento !== undefined) {
      this.validarFechaNacimiento(dto.fechaNacimiento);
    }

    const existente = await this.pacienteRepository.findById(id);
    if (!existente) throw new NotFoundError('Paciente not found');

    await this.validarUnicidad(dto.dni, dto.email, id);

    const updated = await this.pacienteRepository.update(
      id,
      this.toPacienteChanges(dto),
    );

    if (!updated) throw new NotFoundError('Paciente not found');
    return this.toDto(updated);
  }

  async remove(id: number): Promise<void> {
    const deleted = await this.pacienteRepository.delete(id);
    if (!deleted) throw new NotFoundError('Paciente not found');
  }
}