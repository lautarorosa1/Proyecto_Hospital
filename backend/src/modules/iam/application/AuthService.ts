import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IAuthService } from './IAuthService';
import { IUsuarioRepository } from '../domain/IUsuarioRepository';
import { Usuario } from '../domain/Rol';
import { LoginDto } from './dtos/LoginDto';
import { RegisterUsuarioDto } from './dtos/RegisterUsuarioDto';
import { AuthResponseDto, UsuarioProfileDto } from './dtos/AuthResponseDto';
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
      roles,
      permisos,
    };
  }

  private signToken(profile: UsuarioProfileDto): string {
    const secret = process.env.JWT_SECRET || 'hospital_secret_dev_key';
    const expiresIn = (process.env.JWT_EXPIRES_IN || '8h') as jwt.SignOptions['expiresIn'];

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
        ? dto.roles.map((r) => r.trim()).filter(Boolean)
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
}

