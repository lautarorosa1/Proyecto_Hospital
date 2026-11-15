export interface UpdatePacienteDto {
  nombre?: string;
  apellido?: string;
  dni?: string;
  email?: string;
  fechaNacimiento?: string; // "YYYY-MM-DD"
  telefono?: string;
  direccion?: string;
}