export interface UsuarioProfileDto {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  roles: string[];
  permisos: string[];
}

export interface AuthResponseDto {
  token: string;
  usuario: UsuarioProfileDto;
}

