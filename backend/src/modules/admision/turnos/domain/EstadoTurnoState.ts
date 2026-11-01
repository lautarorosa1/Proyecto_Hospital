import type { EstadoTurno } from './Turno';
import { TransicionInvalidaError } from '../../../../shared/errors';

/**
 * Patrón State (Épica 2). Cada estado del turno es un objeto que sabe a qué
 * estado puede pasar y cuáles acciones rechaza. Cada acción devuelve el estado
 * siguiente o lanza TransicionInvalidaError.
 *
 * Mapa de transiciones permitidas:
 *   programado     --confirmar-->        confirmado
 *   confirmado     --registrarLlegada--> en_sala_espera
 *   en_sala_espera --atender-->          atendido
 *   programado | confirmado --cancelar--> cancelado
 * "disponible" es un slot sin reservar: ninguna acción aplica (se reserva con reservar()).
 */
export interface EstadoTurnoState {
  readonly nombre: EstadoTurno;
  confirmar(): EstadoTurno;
  registrarLlegada(): EstadoTurno;
  atender(): EstadoTurno;
  cancelar(): EstadoTurno;
}

abstract class EstadoBase implements EstadoTurnoState {
  abstract readonly nombre: EstadoTurno;

  protected rechazar(mensaje: string): never {
    throw new TransicionInvalidaError(mensaje);
  }

  private porDefecto(accion: string): never {
    return this.rechazar(
      `No se puede ${accion} un turno en estado "${this.nombre}"`,
    );
  }

  confirmar(): EstadoTurno {
    return this.porDefecto('confirmar');
  }
  registrarLlegada(): EstadoTurno {
    return this.porDefecto('registrar la llegada de');
  }
  atender(): EstadoTurno {
    return this.porDefecto('atender');
  }
  cancelar(): EstadoTurno {
    return this.porDefecto('cancelar');
  }
}

class Disponible extends EstadoBase {
  readonly nombre = 'disponible' as const;
  confirmar(): EstadoTurno {
    return this.rechazar('El turno todavía no fue reservado');
  }
  registrarLlegada(): EstadoTurno {
    return this.rechazar('El turno todavía no fue reservado');
  }
  atender(): EstadoTurno {
    return this.rechazar('El turno todavía no fue reservado');
  }
  cancelar(): EstadoTurno {
    return this.rechazar('El turno no está reservado');
  }
}

class Programado extends EstadoBase {
  readonly nombre = 'programado' as const;
  confirmar(): EstadoTurno {
    return 'confirmado';
  }
  registrarLlegada(): EstadoTurno {
    return this.rechazar(
      'El turno debe estar confirmado antes de registrar la llegada del paciente',
    );
  }
  atender(): EstadoTurno {
    return this.rechazar(
      'El turno debe estar en sala de espera antes de ser atendido',
    );
  }
  cancelar(): EstadoTurno {
    return 'cancelado';
  }
}

class Confirmado extends EstadoBase {
  readonly nombre = 'confirmado' as const;
  confirmar(): EstadoTurno {
    return this.rechazar('El turno ya está confirmado');
  }
  registrarLlegada(): EstadoTurno {
    return 'en_sala_espera';
  }
  atender(): EstadoTurno {
    return this.rechazar(
      'El turno debe estar en sala de espera antes de ser atendido',
    );
  }
  cancelar(): EstadoTurno {
    return 'cancelado';
  }
}

class EnSalaEspera extends EstadoBase {
  readonly nombre = 'en_sala_espera' as const;
  confirmar(): EstadoTurno {
    return this.rechazar('El paciente ya está en sala de espera');
  }
  registrarLlegada(): EstadoTurno {
    return this.rechazar('El paciente ya está en sala de espera');
  }
  atender(): EstadoTurno {
    return 'atendido';
  }
}

class Atendido extends EstadoBase {
  readonly nombre = 'atendido' as const;
  confirmar(): EstadoTurno {
    return this.rechazar('El turno ya fue atendido');
  }
  registrarLlegada(): EstadoTurno {
    return this.rechazar('El turno ya fue atendido');
  }
  atender(): EstadoTurno {
    return this.rechazar('El turno ya fue atendido');
  }
  cancelar(): EstadoTurno {
    return this.rechazar('Un turno atendido no puede cancelarse');
  }
}

class Cancelado extends EstadoBase {
  readonly nombre = 'cancelado' as const;
  private static readonly MENSAJE =
    'Un turno cancelado no puede avanzar en el flujo de atención';
  confirmar(): EstadoTurno {
    return this.rechazar(Cancelado.MENSAJE);
  }
  registrarLlegada(): EstadoTurno {
    return this.rechazar(Cancelado.MENSAJE);
  }
  atender(): EstadoTurno {
    return this.rechazar(Cancelado.MENSAJE);
  }
  cancelar(): EstadoTurno {
    return this.rechazar('El turno ya está cancelado');
  }
}

const ESTADOS: Record<EstadoTurno, EstadoTurnoState> = {
  disponible: new Disponible(),
  programado: new Programado(),
  confirmado: new Confirmado(),
  en_sala_espera: new EnSalaEspera(),
  atendido: new Atendido(),
  cancelado: new Cancelado(),
};

/** Devuelve el objeto State que corresponde al estado persistido del turno. */
export function estadoDe(estado: EstadoTurno): EstadoTurnoState {
  return ESTADOS[estado];
}
