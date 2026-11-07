export type NombreRol =
  | 'Administrador'
  | 'Médico'
  | 'Enfermero'
  | 'Recepcionista'
  | 'Paciente'
  | 'Administrativo'
  | 'Maestranza';

export const ROLES_VALIDOS: NombreRol[] = [
  'Administrador',
  'Médico',
  'Enfermero',
  'Recepcionista',
  'Paciente',
  'Administrativo',
  'Maestranza',
];

export interface Permiso {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface Rol {
  id: number;
  nombre: NombreRol | string;
  permisos: Permiso[];
}

export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  passwordHash: string;
  activo: boolean;
  fechaCreacion: Date;
  roles: Rol[];
}

