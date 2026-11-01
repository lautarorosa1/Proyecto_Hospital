import type { AsignacionCama } from './AsignacionCama';
import type { Cama, CamaMapa } from './Cama';
import type { EstadoCama } from './EstadoCama';
import type { HistorialEstadoCama } from './HistorialEstadoCama';

export type FalloCama = 'no_encontrada' | 'version' | 'transicion' | 'doble_asignacion';

export type ResultadoCambioCama =
  | {
      ok: true;
      cama: Cama;
      historial: HistorialEstadoCama;
      asignacion: AsignacionCama | null;
    }
  | { ok: false; fallo: FalloCama };

export interface ICamaRepository {
  crear(data: { numero: string; habitacion_id: number }): Promise<Cama>;
  buscarPorId(id: number): Promise<Cama | null>;
  buscarMapa(filtro: { estado?: EstadoCama; sector?: string }): Promise<CamaMapa[]>;
  asignar(input: {
    camaId: number;
    pacienteId: number;
    usuarioId: number;
    version: number;
  }): Promise<ResultadoCambioCama>;
  cambiarEstado(input: {
    camaId: number;
    estadoNuevo: EstadoCama;
    usuarioId: number;
    version: number;
  }): Promise<ResultadoCambioCama>;
}