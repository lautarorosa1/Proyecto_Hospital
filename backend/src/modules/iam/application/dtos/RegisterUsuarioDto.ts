import { NombreRol } from '../../domain/Rol';

export interface RegisterUsuarioDto {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  roles: (NombreRol | string)[];
}

