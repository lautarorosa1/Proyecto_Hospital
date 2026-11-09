export interface Paciente {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  fechaNacimiento: string; // "YYYY-MM-DD"
  telefono?: string;
  direccion?: string;
  /** false = baja lógica: se conserva por los turnos e ingresos que lo referencian. */
  activo: boolean;
}