import type { EstadoEspera } from '../../domain/ListaEspera';

export interface ResponseEsperaDto {
  id: number;
  profesionalId: number;
  pacienteId: number;
  fecha: string;
  estado: EstadoEspera;
  /** Posición en la cola (1 = primero en ser promovido). */
  posicion: number;
  turnoId?: number;
}
