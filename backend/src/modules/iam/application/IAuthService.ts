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

export interface IAuthService {
  hashPassword(password: string): Promise<string>;
  login(dto: LoginDto): Promise<AuthResponseDto>;
  register(dto: RegisterUsuarioDto): Promise<AuthResponseDto>;
  getProfile(userId: string): Promise<UsuarioProfileDto>;
  getAllRoles(): Promise<RolDetalleDto[]>;
  createRol(dto: CreateRolDto): Promise<RolDetalleDto>;
  updateRol(id: number, dto: UpdateRolDto): Promise<RolDetalleDto>;
  deleteRol(id: number): Promise<void>;
  getAllUsuarios(): Promise<UsuarioProfileDto[]>;
  getUsuarioById(id: string): Promise<UsuarioProfileDto>;
  updateUsuario(id: string, dto: UpdateUsuarioDto): Promise<UsuarioProfileDto>;
  toggleEstadoUsuario(id: string, activo?: boolean): Promise<UsuarioProfileDto>;
  assignRoles(usuarioId: string, dto: AssignRolesDto): Promise<UsuarioProfileDto>;
  removeRol(usuarioId: string, rolId: number): Promise<UsuarioProfileDto>;
}
