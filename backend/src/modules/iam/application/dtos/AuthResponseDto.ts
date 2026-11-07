import { Permiso } from '../../domain/Rol';

export interface RolDetalleDto {
  id: number;
  nombre: string;
  descripcion?: string;
  permisos: Permiso[];
  cantidadUsuarios?: number;
  esEsencial?: boolean;
}

export interface UsuarioProfileDto {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  activo?: boolean;
  fechaCreacion?: Date;
  roles: string[];
  rolesDetalle?: { id: number; nombre: string; descripcion?: string }[];
  permisos: string[];
}

export interface AuthResponseDto {
  token: string;
  usuario: UsuarioProfileDto;
}

export interface UpdateUsuarioDto {
  nombre?: string;
  apellido?: string;
  email?: string;
}

export interface AssignRolesDto {
  roles?: string[];
  rolId?: number;
}

export interface CreateRolDto {
  nombre: string;
  descripcion?: string;
}

export interface UpdateRolDto {
  nombre?: string;
  descripcion?: string;
}
