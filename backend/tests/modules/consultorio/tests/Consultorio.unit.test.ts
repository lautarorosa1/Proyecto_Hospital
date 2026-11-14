import { test } from 'node:test';
import assert from 'node:assert/strict';

import { DomainEvents, type EventPayloads } from '../../../../src/shared/domain/events/DomainEvents';
import type { EventHandler, IEventBus } from '../../../../src/shared/domain/events/IEventBus';
import { OcupacionService } from '../../../../src/modules/consultorio/application/OcupacionService';
import { AgendaConsultorioService } from '../../../../src/modules/consultorio/application/AgendaConsultorioService';
import { NotificacionService } from '../../../../src/modules/consultorio/application/NotificacionService';
import { ConflictError } from '../../../../src/shared/errors';
import { CamaService } from '../../../../src/modules/recursos-camas/application/CamaService';
import type { OcupacionConsultorio } from '../../../../src/modules/consultorio/domain/OcupacionConsultorio';
import type { IOcupacionRepository } from '../../../../src/modules/consultorio/domain/IOcupacionRepository';
import type { INotificacionRepository } from '../../../../src/modules/consultorio/domain/INotificacionRepository';
import type { NotificacionConsultorio } from '../../../../src/modules/consultorio/domain/NotificacionConsultorio';
import type { Habitacion } from '../../../../src/modules/recursos-camas/domain/Habitacion';
import type { ResponseTurnoDto } from '../../../../src/modules/admision/turnos/application/dtos/ResponseTurnoDto';

// ---------- Dobles ----------
class BusFalso implements IEventBus {
  publicados: { evento: DomainEvents; payload: unknown }[] = [];
  publish<K extends DomainEvents>(event: K, payload: EventPayloads[K]): void {
    this.publicados.push({ evento: event, payload });
  }
  subscribe<K extends DomainEvents>(_e: K, _h: EventHandler<K>): void {}
  de(e: DomainEvents) { return this.publicados.filter((p) => p.evento === e); }
}

/** Reproduce los índices únicos parciales de la base: 1 activa por sala y por profesional. */
class OcupacionesMemoria implements IOcupacionRepository {
  items: OcupacionConsultorio[] = [];
  async abrir(habitacionId: number, profesionalId: number) {
    if (this.items.some((o) => o.estado === 'activa' && (o.habitacionId === habitacionId || o.profesionalId === profesionalId))) {
      throw new ConflictError('El consultorio acaba de ser ocupado o el profesional ya tiene un consultorio abierto');
    }
    const o: OcupacionConsultorio = { id: this.items.length + 1, habitacionId, profesionalId, estado: 'activa', iniciadaEn: new Date() };
    this.items.push(o);
    return { ...o };
  }
  async findActivaByProfesional(id: number) { return this.items.find((o) => o.estado === 'activa' && o.profesionalId === id) ?? null; }
  async findActivaByHabitacion(id: number) { return this.items.find((o) => o.estado === 'activa' && o.habitacionId === id) ?? null; }
  async findActivas() { return this.items.filter((o) => o.estado === 'activa'); }
  async finalizar(id: number) {
    const o = this.items.find((x) => x.id === id && x.estado === 'activa');
    if (!o) return false;
    o.estado = 'finalizada';
    return true;
  }
}

const habitaciones: Habitacion[] = [
  { id: 1, numero: 'C1', piso: '1', sector: 'Consultorios', tipo: 'CONSULTORIO' },
  { id: 2, numero: 'C2', piso: '1', sector: 'Consultorios', tipo: 'CONSULTORIO' },
  { id: 3, numero: '101', piso: '1', sector: 'Clínica', tipo: 'INTERNACION' },
];
const habitacionRepo = {
  findAll: async () => habitaciones,
  findById: async (id: number) => habitaciones.find((h) => h.id === id) ?? null,
};
const profesionalRepo = {
  findById: async (id: number) =>
    id <= 3 ? { id, nombre: `Dr${id}`, apellido: `Ap${id}`, estado: id === 3 ? 'licencia' : 'activo' } : null,
};

function servicio() {
  const bus = new BusFalso();
  const ocupaciones = new OcupacionesMemoria();
  const service = new OcupacionService(ocupaciones, habitacionRepo as never, profesionalRepo as never, bus);
  return { bus, ocupaciones, service };
}

// ---------- Ocupación de consultorios ----------
test('El profesional abre un consultorio: queda ocupado y se publica el evento', async () => {
  const { service, bus } = servicio();
  const r = await service.abrir({ profesionalId: 1, habitacionId: 1 });
  assert.equal(r.habitacion.numero, 'C1');
  assert.equal(bus.de(DomainEvents.CONSULTORIO_OCUPADO).length, 1);

  const lista = await service.listarConsultorios();
  assert.equal(lista.length, 2); // solo los CONSULTORIO, no la habitación de internación
  assert.equal(lista.find((c) => c.id === 1)?.ocupacion?.profesionalNombre, 'Ap1, Dr1');
  assert.equal(lista.find((c) => c.id === 2)?.ocupacion, null);
  assert.equal((await service.actual(1))?.habitacionId, 1);
});

test('No se puede abrir una habitación de internación ni con un profesional inactivo o inexistente', async () => {
  const { service } = servicio();
  await assert.rejects(() => service.abrir({ profesionalId: 1, habitacionId: 3 }), /internación, no un consultorio/);
  await assert.rejects(() => service.abrir({ profesionalId: 3, habitacionId: 1 }), /no está activo/);
  await assert.rejects(() => service.abrir({ profesionalId: 99, habitacionId: 1 }), /Profesional not found/);
  await assert.rejects(() => service.abrir({ profesionalId: 1, habitacionId: 99 }), /Habitación no encontrada/);
});

test('Un consultorio ocupado rechaza a otro profesional y un profesional no ocupa dos salas', async () => {
  const { service } = servicio();
  await service.abrir({ profesionalId: 1, habitacionId: 1 });
  await assert.rejects(() => service.abrir({ profesionalId: 2, habitacionId: 1 }), /ocupado por Ap1, Dr1/);
  await assert.rejects(() => service.abrir({ profesionalId: 1, habitacionId: 2 }), /ya tiene abierto el consultorio C1/);
});

test('Dos profesionales abren la misma sala a la vez: solo uno gana', async () => {
  const { service } = servicio();
  const r = await Promise.allSettled([
    service.abrir({ profesionalId: 1, habitacionId: 1 }),
    service.abrir({ profesionalId: 2, habitacionId: 1 }),
  ]);
  assert.equal(r.filter((x) => x.status === 'fulfilled').length, 1);
  assert.equal(r.filter((x) => x.status === 'rejected').length, 1);
});

test('Cerrar libera la sala para otro profesional y publica el evento', async () => {
  const { service, bus } = servicio();
  await service.abrir({ profesionalId: 1, habitacionId: 1 });
  await service.cerrar(1);
  assert.equal(bus.de(DomainEvents.CONSULTORIO_LIBERADO).length, 1);
  assert.equal(await service.actual(1), null);
  await service.abrir({ profesionalId: 2, habitacionId: 1 }); // ahora sí
  await assert.rejects(() => service.cerrar(1), /no tiene un consultorio abierto/);
});

test('Un consultorio no admite camas de internación', async () => {
  const camas = new CamaService({} as never, habitacionRepo as never, {} as never);
  await assert.rejects(() => camas.crear({ numero: 'X', habitacion_id: 1 }), /no admite camas/);
});

// ---------- Agenda, sala de espera y atención ----------
const turno = (id: number, hora: string, estado: ResponseTurnoDto['estado'], pacienteId?: number, profesionalId = 1): ResponseTurnoDto => ({
  id, profesionalId, pacienteId, fecha: '2026-11-13', horaInicio: hora, horaFin: hora, duracionMin: 30,
  estado, version: 1, esEntreturno: false, reducido: false,
});

function agenda(ocupaciones = new OcupacionesMemoria()) {
  const atendidos: number[] = [];
  const turnos = {
    getAll: async (f: { profesionalId?: number }) => [
      turno(4, '11:00', 'disponible'),
      turno(2, '10:30', 'en_sala_espera', 11),
      turno(1, '10:00', 'atendido', 10),
      turno(3, '10:45', 'cancelado', 12),
      turno(5, '09:00', 'confirmado', 13),
    ].filter(() => f.profesionalId === 1),
    getById: async (id: number) => (id === 7 ? turno(7, '12:00', 'en_sala_espera', 11, 2) : turno(id, '10:30', 'en_sala_espera', 11)),
    atender: async (id: number) => { atendidos.push(id); return turno(id, '10:30', 'atendido', 11); },
  };
  const pacientes = { findById: async (id: number) => ({ id, nombre: `N${id}`, apellido: `A${id}`, dni: `${id}000` }) };
  const service = new AgendaConsultorioService(turnos as never, pacientes as never, profesionalRepo as never, ocupaciones);
  return { service, ocupaciones, atendidos };
}

test('La agenda omite los horarios libres, ordena por hora y cuenta por estado', async () => {
  const { service } = agenda();
  const a = await service.agenda(1, '2026-11-13');
  assert.deepEqual(a.turnos.map((t) => t.horaInicio), ['09:00', '10:00', '10:30', '10:45']);
  assert.equal(a.turnos[2].paciente?.apellido, 'A11');
  assert.deepEqual(a.resumen, { programado: 0, confirmado: 1, en_sala_espera: 1, atendido: 1, cancelado: 1 });
  await assert.rejects(() => service.agenda(1, '13/11/2026'), /YYYY-MM-DD/);
  await assert.rejects(() => service.agenda(99), /Profesional not found/);
});

test('La sala de espera muestra solo a los pacientes que ya llegaron', async () => {
  const { service } = agenda();
  const sala = await service.salaEspera(1, '2026-11-13');
  assert.equal(sala.length, 1);
  assert.equal(sala[0].paciente?.nombre, 'N11');
});

test('Atender exige un consultorio abierto y que el turno sea del profesional', async () => {
  const { service, ocupaciones, atendidos } = agenda();
  await assert.rejects(() => service.atender(1, 2), /Abrí un consultorio/);
  assert.deepEqual(atendidos, []);

  await ocupaciones.abrir(1, 1);
  await assert.rejects(() => service.atender(1, 7), /no pertenece a este profesional/);
  const r = await service.atender(1, 2);
  assert.equal(r.estado, 'atendido');
  assert.deepEqual(atendidos, [2]);
});

// ---------- Notificaciones ----------
class NotificacionesMemoria implements INotificacionRepository {
  items: NotificacionConsultorio[] = [];
  async crear(d: Omit<NotificacionConsultorio, 'id' | 'leida' | 'creadaEn'>) {
    const n = { ...d, id: this.items.length + 1, leida: false, creadaEn: new Date() };
    this.items.push(n);
    return n;
  }
  async listar(p: number, o: { soloNoLeidas?: boolean }) {
    return this.items.filter((n) => n.profesionalId === p && (!o.soloNoLeidas || !n.leida)).reverse();
  }
  async contarNoLeidas(p: number) { return this.items.filter((n) => n.profesionalId === p && !n.leida).length; }
  async marcarLeida(id: number, p: number) {
    const n = this.items.find((x) => x.id === id && x.profesionalId === p);
    if (!n) return false;
    n.leida = true;
    return true;
  }
  async marcarTodasLeidas(p: number) {
    const pend = this.items.filter((n) => n.profesionalId === p && !n.leida);
    pend.forEach((n) => (n.leida = true));
    return pend.length;
  }
}

test('Las notificaciones se guardan, se envían en tiempo real y se marcan como leídas', async () => {
  const enviadas: number[] = [];
  const service = new NotificacionService(new NotificacionesMemoria(), (n) => enviadas.push(n.profesionalId));
  await service.notificar({ profesionalId: 1, tipo: 'SALA_ESPERA', titulo: 'a', mensaje: 'm1' });
  await service.notificar({ profesionalId: 1, tipo: 'TURNO_CANCELADO', titulo: 'b', mensaje: 'm2' });
  await service.notificar({ profesionalId: 2, tipo: 'SALA_ESPERA', titulo: 'c', mensaje: 'm3' });
  assert.deepEqual(enviadas, [1, 1, 2]);

  const r = await service.listar(1);
  assert.equal(r.noLeidas, 2);
  assert.equal(r.notificaciones[0].mensaje, 'm2'); // más reciente primero

  await service.marcarLeida(1, r.notificaciones[0].id);
  assert.equal((await service.listar(1)).noLeidas, 1);
  await assert.rejects(() => service.marcarLeida(2, 1), /no encontrada/); // es de otro profesional
  assert.deepEqual(await service.marcarTodasLeidas(1), { marcadas: 1 });
  assert.equal((await service.listar(1, { soloNoLeidas: true })).notificaciones.length, 0);
});

test('Si falla el envío en tiempo real la notificación igual queda guardada', async () => {
  const repo = new NotificacionesMemoria();
  const service = new NotificacionService(repo, () => { throw new Error('sse caído'); });
  await service.notificar({ profesionalId: 1, tipo: 'SALA_ESPERA', titulo: 'a', mensaje: 'm' });
  assert.equal(repo.items.length, 1);
});
