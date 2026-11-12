import type { TipoIngreso } from '../../../../../shared/domain/events/DomainEvents';

export interface ResponseIngresoInternacionDto {
  pacienteId: number;
  tipoIngreso: TipoIngreso;
  motivoIngreso: string;
  /** El ingreso se confirma ya; Enfermería crea la internación y el protocolo en forma asíncrona. */
  estado: 'ingreso_confirmado';
  confirmadoEn: string; // ISO
}
