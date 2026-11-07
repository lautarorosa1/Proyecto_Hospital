import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IAuthService } from './IAuthService';
import { IUsuarioRepository } from '../domain/IUsuarioRepository';
import { Rol, ROLES_VALIDOS, Usuario } from '../domain/Rol';
import { LoginDto } from './dtos/LoginDto';
import { RegisterUsuarioDto } from './dtos/RegisterUsuarioDto';
import {
  AssignRolesDto,
  AuthResponseDto,
  CreateRolDto,
  RolDetalleDto,
  UpdateRolDto,
  UpdateUsuarioDto,
  UsuarioProfileDto,
} from './dtos/AuthResponseDto';
import {
  AppError,
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../../../shared/errors';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SALT_ROUNDS = 10;

export class AuthService implements IAuthService {
  constructor(private readonly usuarioRepository: IUsuarioRepository) {}

  private extractRolesAndPermisos(usuario: Usuario): {
    roles: string[];
    permisos: string[];
  } {
    const roles = usuario.roles.map((r) => r.nombre);
    const permisosSet = new Set<string>();

    for (const rol of usuario.roles) {
      for (const permiso of rol.permisos || []) {
        permisosSet.add(permiso.nombre);
      }
    }

    return {
      roles,
      permisos: Array.from(permisosSet),
    };
  }

  private toProfileDto(usuario: Usuario): UsuarioProfileDto {
    const { roles, permisos } = this.extractRolesAndPermisos(usuario);
    return {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      activo: usuario.activo,
      fechaCreacion: usuario.fechaCreacion,
      roles,
      rolesDetalle: usuario.roles.map((r) => ({
        id: r.id,
        nombre: r.nombre,
        descripcion: r.descripcion,
      })),
      permisos,
    };
  }

  private toRolDto(rol: Rol): RolDetalleDto {
    return {
      id: rol.id,
      nombre: rol.nombre,
      descripcion: rol.descripcion || '',
      permisos: rol.permisos || [],
      cantidadUsuarios: rol.cantidadUsuarios ?? 0,
      esEsencial: ROLES_VALIDOS.includes(rol.nombre as never),
    };
  }

  private signToken(profile: UsuarioProfileDto): string {
    const secret = process.env.JWT_SECRET || 'hospital_secret_dev_key';
    const expiresIn = (process.env.JWT_EXPIRES_IN ||
      '8h') as jwt.SignOptions['expiresIn'];

    return jwt.sign(
      {
        userId: profile.id,
        email: profile.email,
        roles: profile.roles,
        permisos: profile.permisos,
      },
      secret,
      { expiresIn },
    );
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    if (!dto.email?.trim() || !dto.password) {
      throw new BadRequestError('Email y password requeridos');
    }

    const email = dto.email.trim().toLowerCase();
    const usuario = await this.usuarioRepository.findByEmail(email);

    if (!usuario) {
      throw new AppError('Credenciales inválidas', 401);
    }

    if (!usuario.activo) {
      throw new AppError('El usuario se encuentra inactivo', 403);
    }

    const passwordValido = await bcrypt.compare(
      dto.password,
      usuario.passwordHash,
    );

    if (!passwordValido) {
      throw new AppError('Credenciales inválidas', 401);
    }

    const profile = this.toProfileDto(usuario);
    const token = this.signToken(profile);

    return {
      token,
      usuario: profile,
    };
  }

  async register(dto: RegisterUsuarioDto): Promise<AuthResponseDto> {
    if (!dto.nombre?.trim()) {
      throw new BadRequestError('El nombre es obligatorio');
    }
    if (!dto.apellido?.trim()) {
      throw new BadRequestError('El apellido es obligatorio');
    }
    if (!dto.email?.trim() || !EMAIL_REGEX.test(dto.email.trim())) {
      throw new BadRequestError('El email no es válido');
    }
    if (!dto.password || dto.password.length < 6) {
      throw new BadRequestError('El password debe tener al menos 6 caracteres');
    }

    const email = dto.email.trim().toLowerCase();
    const existente = await this.usuarioRepository.findByEmail(email);
    if (existente) {
      throw new ConflictError('Ya existe un usuario con ese email');
    }

    const nombresRoles =
      Array.isArray(dto.roles) && dto.roles.length > 0
        ? dto.roles.map((r) => String(r).trim()).filter(Boolean)
        : ['Paciente'];

    const roles = await this.usuarioRepository.findOrCreateRoles(nombresRoles);
    const passwordHash = await this.hashPassword(dto.password);

    const nuevoUsuario = await this.usuarioRepository.create({
      nombre: dto.nombre.trim(),
      apellido: dto.apellido.trim(),
      email,
      passwordHash,
      roles,
    });

    const profile = this.toProfileDto(nuevoUsuario);
    const token = this.signToken(profile);

    return {
      token,
      usuario: profile,
    };
  }

  async getProfile(userId: string): Promise<UsuarioProfileDto> {
    const usuario = await this.usuarioRepository.findById(userId);
    if (!usuario) {
      throw new NotFoundError('Usuario no encontrado');
    }
    return this.toProfileDto(usuario);
  }

  async getAllRoles(): Promise<RolDetalleDto[]> {
    const roles = await this.usuarioRepository.findAllRoles();
    return roles.map((r) => this.toRolDto(r));
  }

  async createRol(dto: CreateRolDto): Promise<RolDetalleDto> {
    if (!dto.nombre?.trim()) {
      throw new BadRequestError('El nombre del rol es obligatorio');
    }

    const nombre = dto.nombre.trim();
    const existente = await this.usuarioRepository.findRolByNombre(nombre);
    if (existente) {
      throw new ConflictError('Ya existe un rol con ese nombre');
    }

    const creado = await this.usuarioRepository.createRol(
      nombre,
      dto.descripcion?.trim(),
    );
    return this.toRolDto(creado);
  }

  async updateRol(id: number, dto: UpdateRolDto): Promise<RolDetalleDto> {
    const actual = await this.usuarioRepository.findRolById(id);
    if (!actual) {
      throw new NotFoundError('Rol no encontrado');
    }

    const changes: UpdateRolDto = {};

    if (dto.nombre !== undefined) {
      const nuevoNombre = dto.nombre.trim();
      if (!nuevoNombre) {
        throw new BadRequestError('El nombre del rol no puede estar vacío');
      }
      const duplicado = await this.usuarioRepository.findRolByNombre(nuevoNombre);
      if (duplicado && duplicado.id !== id) {
        throw new ConflictError('Ya existe otro rol con ese nombre');
      }
      changes.nombre = nuevoNombre;
    }

    if (dto.descripcion !== undefined) {
      changes.descripcion = dto.descripcion.trim();
    }

    const actualizado = await this.usuarioRepository.updateRol(id, changes);
    if (!actualizado) {
      throw new NotFoundError('Rol no encontrado');
    }

    return this.toRolDto(actualizado);
  }

  async deleteRol(id: number): Promise<void> {
    const rol = await this.usuarioRepository.findRolById(id);
    if (!rol) {
      throw new NotFoundError('Rol no encontrado');
    }

    if (ROLES_VALIDOS.includes(rol.nombre as never)) {
      throw new BadRequestError(
        `No se puede eliminar el rol esencial del sistema "${rol.nombre}"`,
      );
    }

    const cantidadUsuarios = await this.usuarioRepository.countUsuariosByRolId(id);
    if (cantidadUsuarios > 0) {
      throw new ConflictError(
        'No se puede eliminar un rol que tiene usuarios asignados',
      );
    }

    const eliminado = await this.usuarioRepository.deleteRol(id);
    if (!eliminado) {
      throw new NotFoundError('Rol no encontrado');
    }
  }

  async getAllUsuarios(): Promise<UsuarioProfileDto[]> {
    const usuarios = await this.usuarioRepository.findAllUsuarios();
    return usuarios.map((u) => this.toProfileDto(u));
  }

  async getUsuarioById(id: string): Promise<UsuarioProfileDto> {
    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario) {
      throw new NotFoundError('Usuario no encontrado');
    }
    return this.toProfileDto(usuario);
  }

  async updateUsuario(
    id: string,
    dto: UpdateUsuarioDto,
  ): Promise<UsuarioProfileDto> {
    const actual = await this.usuarioRepository.findById(id);
    if (!actual) {
      throw new NotFoundError('Usuario no encontrado');
    }

    const changes: UpdateUsuarioDto = {};

    if (dto.nombre !== undefined) {
      if (!dto.nombre.trim()) {
        throw new BadRequestError('El nombre no puede estar vacío');
      }
      changes.nombre = dto.nombre.trim();
    }

    if (dto.apellido !== undefined) {
      if (!dto.apellido.trim()) {
        throw new BadRequestError('El apellido no puede estar vacío');
      }
      changes.apellido = dto.apellido.trim();
    }

    if (dto.email !== undefined) {
      const email = dto.email.trim().toLowerCase();
      if (!EMAIL_REGEX.test(email)) {
        throw new BadRequestError('El email no es válido');
      }
      const duplicado = await this.usuarioRepository.findByEmail(email);
      if (duplicado && duplicado.id !== id) {
        throw new ConflictError('Ya existe otro usuario con ese email');
      }
      changes.email = email;
    }

    const actualizado = await this.usuarioRepository.updateUsuario(id, changes);
    if (!actualizado) {
      throw new NotFoundError('Usuario no encontrado');
    }

    return this.toProfileDto(actualizado);
  }

  async toggleEstadoUsuario(
    id: string,
    activo?: boolean,
  ): Promise<UsuarioProfileDto> {
    const actual = await this.usuarioRepository.findById(id);
    if (!actual) {
      throw new NotFoundError('Usuario no encontrado');
    }

    const nuevoEstado = typeof activo === 'boolean' ? activo : !actual.activo;
    const actualizado = await this.usuarioRepository.updateEstado(id, nuevoEstado);
    if (!actualizado) {
      throw new NotFoundError('Usuario no encontrado');
    }

    return this.toProfileDto(actualizado);
  }

  async assignRoles(
    usuarioId: string,
    dto: AssignRolesDto,
  ): Promise<UsuarioProfileDto> {
    const usuario = await this.usuarioRepository.findById(usuarioId);
    if (!usuario) {
      throw new NotFoundError('Usuario no encontrado');
    }

    const rolesMap = new Map<number, Rol>();
    for (const r of usuario.roles) {
      rolesMap.set(r.id, r);
    }

    if (typeof dto.rolId === 'number') {
      const rol = await this.usuarioRepository.findRolById(dto.rolId);
      if (!rol) {
        throw new NotFoundError('Rol no encontrado');
      }
      rolesMap.set(rol.id, rol);
    } else if (Array.isArray(dto.roles) && dto.roles.length > 0) {
      const nombres = dto.roles.map((r) => String(r).trim()).filter(Boolean);
      const encontrados = await this.usuarioRepository.findOrCreateRoles(nombres);
      for (const r of encontrados) {
        rolesMap.set(r.id, r);
      }
    } else {
      throw new BadRequestError('Debe indicar al menos un rol (roles o rolId)');
    }

    const actualizado = await this.usuarioRepository.setUsuarioRoles(
      usuarioId,
      Array.from(rolesMap.values()),
    );
    if (!actualizado) {
      throw new NotFoundError('Usuario no encontrado');
    }

    return this.toProfileDto(actualizado);
  }

  async removeRol(
    usuarioId: string,
    rolId: number,
  ): Promise<UsuarioProfileDto> {
    const usuario = await this.usuarioRepository.findById(usuarioId);
    if (!usuario) {
      throw new NotFoundError('Usuario no encontrado');
    }

    const tieneRol = usuario.roles.some((r) => r.id === rolId);
    if (!tieneRol) {
      throw new NotFoundError('El usuario no posee el rol especificado');
    }

    const restantes = usuario.roles.filter((r) => r.id !== rolId);
    const actualizado = await this.usuarioRepository.setUsuarioRoles(
      usuarioId,
      restantes,
    );
    if (!actualizado) {
      throw new NotFoundError('Usuario no encontrado');
    }

    return this.toProfileDto(actualizado);
  }
}
