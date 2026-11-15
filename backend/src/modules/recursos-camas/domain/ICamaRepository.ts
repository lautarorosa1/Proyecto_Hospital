import type { AsignacionCama } from './AsignacionCama';
import type { Cama, CamaMapa } from './Cama';
import type { EstadoCama } from './EstadoCama';
import type { HistorialEstadoCama } from './HistorialEstadoCama';

export type FalloCama = 'no_encontrada' | 'transicion' | 'doble_asignacion';

export type ResultadoCambioCama =
  | {
      ok: true;
      cama: Cama;
      historial: HistorialEstadoCama;
      asignacion: AsignacionCama | null;
    }
  | { ok: false; fallo: FalloCama };

export interface ICamaRepository {
  crear(data: { habitacion_id: number }): Promise<Cama>;
  buscarPorId(id: number): Promise<Cama | null>;
  buscarMapa(filtro: { estado?: EstadoCama; sector?: string }): Promise<CamaMapa[]>;
  actualizarHabitacion(id: number, habitacionId: number): Promise<Cama | null>;
  asignar(input: {
    camaId: number;
    pacienteId: number;
    usuarioId: number;
  }): Promise<ResultadoCambioCama>;
  cambiarEstado(input: {
    camaId: number;
    estadoNuevo: EstadoCama;
    usuarioId: number;
  }): Promise<ResultadoCambioCama>;
}
