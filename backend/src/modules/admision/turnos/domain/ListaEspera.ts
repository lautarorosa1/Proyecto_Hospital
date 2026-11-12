// HU 1.3 - Lista de espera (standby) de entreturnos.
// La cola se ordena por orden de llegada (creadoEn, id): la posición 1 es la
// primera en ser promovida cuando se libera un horario del mismo día.
export const ESTADOS_ESPERA = ['en_espera', 'asignado', 'descartado'] as const;
export type EstadoEspera = (typeof ESTADOS_ESPERA)[number];

export interface EsperaTurno {
  id: number;
  profesionalId: number;
  pacienteId: number;
  fecha: string; // "YYYY-MM-DD"
  estado: EstadoEspera;
  turnoId?: number; // turno asignado al promover
  creadoEn: Date;
}

export type NuevaEspera = Pick<EsperaTurno, 'profesionalId' | 'pacienteId' | 'fecha'>;
