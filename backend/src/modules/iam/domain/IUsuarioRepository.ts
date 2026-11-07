import { Rol, Usuario } from './Rol';

export interface CreateUsuarioData {
  nombre: string;
  apellido: string;
  email: string;
  passwordHash: string;
  roles: Rol[];
}

export interface IUsuarioRepository {
  findByEmail(email: string): Promise<Usuario | null>;
  findById(id: string): Promise<Usuario | null>;
  create(data: CreateUsuarioData): Promise<Usuario>;
  findAllRoles(): Promise<Rol[]>;
  findOrCreateRoles(nombres: string[]): Promise<Rol[]>;
}

