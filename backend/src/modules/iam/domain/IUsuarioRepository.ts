import { Rol, Usuario } from './Rol';

export interface CreateUsuarioData {
  nombre: string;
  apellido: string;
  email: string;
  passwordHash: string;
  roles: Rol[];
}

export interface UpdateUsuarioData {
  nombre?: string;
  apellido?: string;
  email?: string;
}

export interface UpdateRolData {
  nombre?: string;
  descripcion?: string;
}

export interface IUsuarioRepository {
  findByEmail(email: string): Promise<Usuario | null>;
  findById(id: string): Promise<Usuario | null>;
  findAllUsuarios(): Promise<Usuario[]>;
  create(data: CreateUsuarioData): Promise<Usuario>;
  updateUsuario(id: string, data: UpdateUsuarioData): Promise<Usuario | null>;
  updateEstado(id: string, activo: boolean): Promise<Usuario | null>;
  setUsuarioRoles(id: string, roles: Rol[]): Promise<Usuario | null>;
  findAllRoles(): Promise<Rol[]>;
  findRolById(id: number): Promise<Rol | null>;
  findRolByNombre(nombre: string): Promise<Rol | null>;
  findOrCreateRoles(nombres: string[]): Promise<Rol[]>;
  createRol(nombre: string, descripcion?: string): Promise<Rol>;
  updateRol(id: number, data: UpdateRolData): Promise<Rol | null>;
  deleteRol(id: number): Promise<boolean>;
  countUsuariosByRolId(rolId: number): Promise<number>;
}
