import { test } from 'node:test';
import assert from 'node:assert/strict';

import { TurnoService } from '../../../../src/modules/admision/turnos/application/TurnoService';
import type { Turno } from '../../../../src/modules/admision/turnos/domain/Turno';
import type { EsperaTurno } from '../../../../src/modules/admision/turnos/domain/ListaEspera';
import type { IListaEsperaRepository } from '../../../../src/modules/admision/turnos/domain/IListaEsperaRepository';
import type { ITurnoNotificador } from '../../../../src/modules/admision/turnos/domain/ITurnoNotificador';

const turno = (extra: Partial<Turno> = {}): Turno => ({
  id: 10, profesionalId: 1, pacienteId: 50, fecha: '2099-01-10', horaInicio: '11:00',
  duracionMin: 30, estado: 'programado', version: 1, esEntreturno: false, ...extra,
});

class EsperaFalsa implements IListaEsperaRepository {
  cola: EsperaTurno[] = [];
  agregar(pacienteId: number) {
    this.cola.push({
      id: this.cola.length + 1, profesionalId: 1, pacienteId, fecha: '2099-01-10',
      estado: 'en_espera', creadoEn: new Date(),
    });
  }
  async crear(): Promise<EsperaTurno> { throw new Error('no usado'); }
  async findEnEspera() { return this.cola.filter((e) => e.estado === 'en_espera'); }
  async findAllEnEspera() { return this.findEnEspera(); }
  async reclamarPrimero() {
    const e = this.cola.find((x) => x.estado === 'en_espera');
    if (!e) return null;
    e.estado = 'asignado';
    return { ...e };
  }
  async registrarTurno(id: number, turnoId: number) {
    const e = this.cola.find((x) => x.id === id)!;
    e.turnoId = turnoId;
  }
  async devolver(id: number) { this.cola.find((x) => x.id === id)!.estado = 'en_espera'; }
  async descartar(id: number) { this.cola.find((x) => x.id === id)!.estado = 'descartado'; }
}

function armar(opts: { reservaOk?: boolean; pacientes?: Record<number, boolean> } = {}) {
  const espera = new EsperaFalsa();
  const avisos: string[] = [];
  let reservado: { id: number; pacienteId: number } | null = null;

  const turnoRepo = {
    findById: async (id: number) =>
      id === 10 ? turno() : id === 99 ? turno({ id: 99, estado: 'disponible', pacienteId: reservado?.pacienteId }) : null,
    cancelarYLiberar: async () => ({
      cancelado: turno({ estado: 'cancelado' }),
      liberado: turno({ id: 99, estado: 'disponible', pacienteId: undefined, version: 1 }),
    }),
    reservar: async (id: number, _v: number, pacienteId: number) => {
      if (opts.reservaOk === false) return false;
      reservado = { id, pacienteId };
      return true;
    },
  };
  const pacientes = opts.pacientes ?? {};
  const pacienteRepo = {
    findById: async (id: number) => ({
      id, nombre: 'Luis', apellido: `Medina${id}`, activo: pacientes[id] ?? true,
    }),
  };
  const notificador = {
    turnoCancelado: () => { avisos.push('cancelado'); },
    listaEsperaPromovida: (_e: EsperaTurno, t: Turno) => { avisos.push(`promovido:${t.id}`); },
  } as unknown as ITurnoNotificador;

  const service = new TurnoService(
    turnoRepo as never, {} as never, pacienteRepo as never, {} as never, notificador, espera,
  );
  return { service, espera, avisos, reservado: () => reservado };
}

test('Al cancelar se promueve automáticamente al primero de la lista de espera y se avisa a recepción', async () => {
  const { service, espera, avisos, reservado } = armar();
  espera.agregar(70); // Luis Medina, primero en la cola
  espera.agregar(71);

  const r = await service.cancelar(10);

  assert.deepEqual(reservado(), { id: 99, pacienteId: 70 });
  assert.equal(r.promovidoDesdeEspera?.pacienteId, 70);
  assert.deepEqual(avisos, ['cancelado', 'promovido:99']);
  assert.equal(espera.cola[1].estado, 'en_espera'); // el segundo sigue esperando
});

test('Si alguien tomó el horario antes, el paciente vuelve a la cola', async () => {
  const { service, espera } = armar({ reservaOk: false });
  espera.agregar(70);
  const r = await service.cancelar(10);
  assert.equal(r.promovidoDesdeEspera, undefined);
  assert.equal(espera.cola[0].estado, 'en_espera');
});

test('Los pacientes dados de baja se descartan y se promueve al siguiente', async () => {
  const { service, espera, reservado } = armar({ pacientes: { 70: false } });
  espera.agregar(70);
  espera.agregar(71);
  await service.cancelar(10);
  assert.equal(espera.cola[0].estado, 'descartado');
  assert.equal(reservado()?.pacienteId, 71);
});

test('Cancelar con lista de espera vacía solo libera el horario', async () => {
  const { service, avisos } = armar();
  const r = await service.cancelar(10);
  assert.equal(r.estado, 'cancelado');
  assert.deepEqual(avisos, ['cancelado']);
});
