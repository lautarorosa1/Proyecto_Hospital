export interface CreateHabitacionDto {
  numero: string;
  piso: string;
  sector: string;
  /** INTERNACION (default) o CONSULTORIO. */
  tipo?: string;
}