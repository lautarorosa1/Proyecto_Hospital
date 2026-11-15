import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  DomainEvents,
  type EventPayloads,
} from '../../../../src/shared/domain/events/DomainEvents';
import type { EventHandler, IEventBus } from '../../../../src/shared/domain/events/IEventBus';

import { ProtocoloDirector } from '../../../../src/modules/atencion-enfermeria/domain/ProtocoloBuilder';
import { RegistrarInternacion } from '../../../../src/modules/atencion-enfermeria/application/RegistrarInternacion';
import { FinalizarInternacion } from '../../../../src/modules/atencion-enfermeria/application/FinalizarInternacion';
import { VincularCamaAInternacion } from '../../../../src/modules/atencion-enfermeria/application/VincularCamaAInternacion';
import { GenerarProtocoloDeIngreso } from '../../../../src/modules/atencion-enfermeria/application/protocolos/GenerarProtocoloDeIngreso';
import { AdministrarDosis } from '../../../../src/modules/atencion-enfermeria/application/AdministrarDosis';
import { RegistrarSignosVitales } from '../../../../src/modules/atencion-enfermeria/application/RegistrarSignosVitales';
import { RegistrarMedicacion } from '../../../../src/modules/atencion-enfermeria/application/RegistrarMedicacion';
import { EventosEnfermeriaBus } from '../../../../src/modules/atencion-enfermeria/infrastructure/EventosEnfermeriaBus';
import { ProtocolosRepositoryMemoria } from '../../../../src/modules/atencion-enfermeria/infrastructure/ProtocolosRepositoryMemoria';
import { SignosVitalesRepositoryMemoria } from '../../../../src/modules/atencion-enfermeria/infrastructure/SignosVitalesMemoria';
import type { Internacion } from '../../../../src/modules/atencion-enfermeria/domain/Internaciones';
import type { IInternacionRepository } from '../../../../src/modules/atencion-enfermeria/domain/InternacionRepository';
import type { Medicacion } from '../../../../src/modules/atencion-enfermeria/domain/Medicaciones';
import type { IMedicacionesRepository } from '../../../../src/modules/atencion-enfermeria/domain/MedicacionesRepository';
import type { IAdministracionesRepository } from '../../../../src/modules/atencion-enfermeria/domain/AdministracionesRepository';
import type { AdministracionMedicacion } from '../../../../src/modules/atencion-enfermeria/domain/AdministracionMedicacion';
import type { INotaEnfermeriaRepository } from '../../../../src/modules/atencion-enfermeria/domain/NotaEnfermeriaRepository';
import type { NotaEnfermeria } from '../../../../src/modules/atencion-enfermeria/domain/NotaEnfermeria';

import { IngresoInternacionService } from '../../../../src/modules/admision/ingresos-internacion/application/IngresoInternacionService';
import { CamaService } from '../../../../src/modules/recursos-camas/application/CamaService';
import { AdaptadorEventosRecursosCamas } from '../../../../src/modules/recursos-camas/adapters/AdaptadorEventosRecursosCamas';
import type { ICamaRepository } from '../../../../src/modules/recursos-camas/domain/ICamaRepository';
import type { Cama } from '../../../../src/modules/recursos-camas/domain/Cama';
import type { EstadoCama } from '../../../../src/modules/recursos-camas/domain/EstadoCama';
import { transicionDirectaPermitida } from '../../../../src/modules/recursos-camas/domain/EstadoCama';

// ---------- Dobles de prueba ----------

/** Bus en memoria: permite esperar a que terminen los suscriptores asíncronos. */
class BusFalso implements IEventBus {
  private handlers = new Map<string, EventHandler<DomainEvents>[]>();
  private pendientes: Promise<unknown>[] = [];
  publicados: { evento: DomainEvents; payload: unknown }[] = [];

  publish<K extends DomainEvents>(event: K, payload: EventPayloads[K]): void {
    this.publicados.push({ evento: event, payload });
    for (const h of this.handlers.get(event) ?? []) {
      this.pendientes.push(Promise.resolve().then(() => h(payload as never)));
    }
  }

  subscribe<K extends DomainEvents>(event: K, handler: EventHandler<K>): void {
    const lista = this.handlers.get(event) ?? [];
    lista.push(handler as EventHandler<DomainEvents>);
    this.handlers.set(event, lista);
  }

  async idle(): Promise<void> {
    while (this.pendientes.length) {
      const lote = this.pendientes.splice(0);
      await Promise.all(lote);
    }
  }

  de<K extends DomainEvents>(evento: K): EventPayloads[K][] {
    return this.publicados
      .filter((p) => p.evento === evento)
      .map((p) => p.payload as EventPayloads[K]);
  }
}

class InternacionesMemoria implements IInternacionRepository {
  items: Internacion[] = [];
  private id = 1;
  async create(d: Omit<Internacion, 'id'>) {
    const n = { ...d, id: this.id++ };
    this.items.push(n);
    return { ...n };
  }
  async findById(id: number) {
    const i = this.items.find((x) => x.id === id);
    return i ? { ...i } : null;
  }
  async findByPacienteId(pacienteId: number) {
    return this.items.filter((x) => x.pacienteId === pacienteId).map((x) => ({ ...x }));
  }
  async findAll() {
    return this.items.map((x) => ({ ...x }));
  }
  async update(id: number, d: Partial<Omit<Internacion, 'id'>>) {
    const i = this.items.findIndex((x) => x.id === id);
    if (i < 0) return null;
    this.items[i] = { ...this.items[i], ...d };
    return { ...this.items[i] };
  }
}

class AdministracionesMemoria implements IAdministracionesRepository {
  items: AdministracionMedicacion[] = [];
  async create(d: Omit<AdministracionMedicacion, 'id'>) {
    const n = { ...d, id: this.items.length + 1 };
    this.items.push(n);
    return n;
  }
  async findByInternacionId(id: number) {
    return this.items.filter((x) => x.internacionId === id);
  }
  async existe(medicacionId: number, programadaPara: string) {
    return this.items.some(
      (x) => x.medicacionId === medicacionId && x.programadaPara === programadaPara,
    );
  }
}

class NotasMemoria implements INotaEnfermeriaRepository {
  items: NotaEnfermeria[] = [];
  async create(d: Omit<NotaEnfermeria, 'id'>) {
    const n = { ...d, id: this.items.length + 1 };
    this.items.push(n);
    return n;
  }
  async findById() { return null; }
  async findAll() { return this.items; }
  async update() { return null; }
  async delete() { return false; }
}

const medicacionBase: Medicacion = {
  id: 1,
  internacionId: 1,
  profesionalId: 9,
  nombre: 'Ibuprofeno 400mg',
  dosis: '400 mg',
  frecuencia: 'Cada 8 horas',
  viaAdministracion: 'Oral',
  fechaInicio: '2026-01-01',
  estado: 'ACTIVA',
  insumoId: 5,
  cantidadInsumo: 1,
};

function medicacionesFalsas(m: Medicacion = medicacionBase): IMedicacionesRepository {
  return { findById: async (id: number) => (id === m.id ? m : null) } as IMedicacionesRepository;
}

const ahora = () => new Date();
const enMinutos = (min: number) => new Date(Date.now() + min * 60_000).toISOString();

// ---------- Builder / Director ----------

test('ProtocoloDirector arma el protocolo Pre-Op con sus tres tareas', () => {
  const p = new ProtocoloDirector().construir('CIRUGIA_PROGRAMADA', 7);
  assert.deepEqual(p.pasos, [
    'Verificar ayuno de 8 horas',
    'Colocar vía intravenosa periférica',
    'Realizar control de signos vitales cada 2 horas',
  ]);
  assert.equal(p.internacionId, 7);
});

test('ProtocoloDirector arma el protocolo respiratorio y uno general por defecto', () => {
  const director = new ProtocoloDirector();
  const resp = director.construir('INFECCION_RESPIRATORIA');
  assert.deepEqual(resp.pasos, [
    'Monitoreo de saturación de oxígeno continuo',
    'Indicación de aislamiento de contacto y gotas',
  ]);
  assert.ok(director.construir('GENERAL').pasos.length > 0);
});

// ---------- Admisión → Enfermería ----------

test('Admisión publica PACIENTE_INGRESADO e infiere ingreso respiratorio por neumonía', async () => {
  const bus = new BusFalso();
  const service = new IngresoInternacionService(
    { findById: async (id: number) => ({ id, activo: true }) } as never,
    bus,
  );
  const r = await service.confirmarIngreso({
    pacienteId: 3,
    motivoIngreso: 'Dificultad respiratoria',
    diagnosticoInicial: 'Neumonía',
  });
  assert.equal(r.tipoIngreso, 'INFECCION_RESPIRATORIA');
  assert.equal(bus.de(DomainEvents.PACIENTE_INGRESADO)[0].tipoIngreso, 'INFECCION_RESPIRATORIA');
});

test('Admisión rechaza ingresos de pacientes inexistentes o de baja', async () => {
  const bus = new BusFalso();
  const inexistente = new IngresoInternacionService({ findById: async () => null } as never, bus);
  await assert.rejects(
    () => inexistente.confirmarIngreso({ pacienteId: 1, motivoIngreso: 'x' }),
    /Paciente not found/,
  );
  const deBaja = new IngresoInternacionService(
    { findById: async () => ({ id: 1, activo: false }) } as never,
    bus,
  );
  await assert.rejects(
    () => deBaja.confirmarIngreso({ pacienteId: 1, motivoIngreso: 'x' }),
    /dado de baja/,
  );
  assert.equal(bus.publicados.length, 0);
});

test('RegistrarInternacion genera el protocolo del tipo de ingreso y rechaza una segunda internación activa', async () => {
  const bus = new BusFalso();
  const internaciones = new InternacionesMemoria();
  const protocolos = new ProtocolosRepositoryMemoria();
  const caso = new RegistrarInternacion(internaciones, {
    generarProtocolo: new GenerarProtocoloDeIngreso(protocolos),
    eventos: new EventosEnfermeriaBus(bus),
  });

  const interna = await caso.ejecutar({
    pacienteId: 1,
    fechaIngreso: '2026-02-01',
    motivoIngreso: 'Cirugía programada',
    estado: 'ACTIVA',
    tipoIngreso: 'CIRUGIA_PROGRAMADA',
  });

  const generados = await protocolos.findByInternacionId(interna.id);
  assert.equal(generados.length, 1);
  assert.ok(generados[0].pasos.includes('Verificar ayuno de 8 horas'));
  assert.equal(bus.de(DomainEvents.INTERNACION_REGISTRADA)[0].protocoloId, generados[0].id);

  await assert.rejects(
    () =>
      caso.ejecutar({
        pacienteId: 1,
        fechaIngreso: '2026-02-02',
        motivoIngreso: 'Otra',
        estado: 'ACTIVA',
      }),
    /internación activa/,
  );
});

// ---------- Enfermería → Recursos (medicación e insumos) ----------

test('AdministrarDosis dentro del margen registra al enfermero y publica el evento de descuento', async () => {
  const bus = new BusFalso();
  const internaciones = new InternacionesMemoria();
  await internaciones.create({
    pacienteId: 4, fechaIngreso: '2026-02-01', motivoIngreso: 'x', estado: 'ACTIVA',
  });
  const administraciones = new AdministracionesMemoria();
  const caso = new AdministrarDosis(
    medicacionesFalsas(), internaciones, administraciones, new EventosEnfermeriaBus(bus),
  );

  const r = await caso.ejecutar({
    medicacionId: 1, enfermeroId: 22, programadaPara: enMinutos(-20),
  });

  assert.equal(r.enfermeroId, 22);
  const [evento] = bus.de(DomainEvents.MEDICACION_ADMINISTRADA);
  assert.equal(evento.insumoId, 5);
  assert.equal(evento.cantidad, 1);
  assert.equal(evento.pacienteId, 4);
  assert.equal(evento.administracionId, r.id);
});

test('AdministrarDosis rechaza fuera del margen de ±30 min y la doble administración', async () => {
  const bus = new BusFalso();
  const internaciones = new InternacionesMemoria();
  await internaciones.create({
    pacienteId: 4, fechaIngreso: '2026-02-01', motivoIngreso: 'x', estado: 'ACTIVA',
  });
  const caso = new AdministrarDosis(
    medicacionesFalsas(), internaciones, new AdministracionesMemoria(), new EventosEnfermeriaBus(bus),
  );

  await assert.rejects(
    () => caso.ejecutar({ medicacionId: 1, enfermeroId: 22, programadaPara: enMinutos(-45) }),
    /±30 minutos/,
  );

  const horario = enMinutos(5);
  await caso.ejecutar({ medicacionId: 1, enfermeroId: 22, programadaPara: horario });
  await assert.rejects(
    () => caso.ejecutar({ medicacionId: 1, enfermeroId: 23, programadaPara: horario }),
    /ya fue registrada/,
  );
  assert.equal(bus.de(DomainEvents.MEDICACION_ADMINISTRADA).length, 1);
});

test('AdministrarDosis sin insumo asociado registra la dosis pero no publica descuento', async () => {
  const bus = new BusFalso();
  const internaciones = new InternacionesMemoria();
  await internaciones.create({
    pacienteId: 4, fechaIngreso: '2026-02-01', motivoIngreso: 'x', estado: 'ACTIVA',
  });
  const sinInsumo = { ...medicacionBase, insumoId: undefined };
  const caso = new AdministrarDosis(
    medicacionesFalsas(sinInsumo), internaciones, new AdministracionesMemoria(), new EventosEnfermeriaBus(bus),
  );
  const r = await caso.ejecutar({ medicacionId: 1, enfermeroId: 22, programadaPara: enMinutos(0) });
  assert.equal(r.cantidadDescontada, 0);
  assert.equal(bus.de(DomainEvents.MEDICACION_ADMINISTRADA).length, 0);
});

test('RegistrarMedicacion bloquea fármacos a los que el paciente es alérgico (HCE)', async () => {
  const internaciones = new InternacionesMemoria();
  await internaciones.create({
    pacienteId: 8, fechaIngreso: '2026-02-01', motivoIngreso: 'x', estado: 'ACTIVA',
  });
  let creada = false;
  const repo = { create: async (d: Omit<Medicacion, 'id'>) => ((creada = true), { ...d, id: 1 }) } as IMedicacionesRepository;
  const caso = new RegistrarMedicacion(repo, {
    internaciones,
    alergias: { alergiaA: async (_p, med) => (/penicilina/i.test(med) ? 'Penicilina' : null) },
  });
  const base = {
    internacionId: 1, profesionalId: 2, dosis: '1 g', frecuencia: 'c/8h',
    viaAdministracion: 'IV', fechaInicio: '2026-02-01', estado: 'ACTIVA' as const,
  };
  await assert.rejects(() => caso.ejecutar({ ...base, nombre: 'Penicilina G' }), /alérgico a Penicilina/);
  assert.equal(creada, false);
  await caso.ejecutar({ ...base, nombre: 'Paracetamol' });
  assert.equal(creada, true);
});

// ---------- Signos vitales: alerta y nota automática ----------

function signosCaso() {
  const bus = new BusFalso();
  const internaciones = new InternacionesMemoria();
  const notas = new NotasMemoria();
  const caso = new RegistrarSignosVitales(new SignosVitalesRepositoryMemoria(), {
    internaciones,
    notas,
    eventos: new EventosEnfermeriaBus(bus),
    ubicacion: { sectorDeCama: async () => 'Clínica médica' },
  });
  return { bus, internaciones, notas, caso };
}

const signos = (temperatura: number) => ({
  internacionId: 1,
  profesionalId: 6,
  fechaHora: ahora().toISOString(),
  temperatura,
  frecuenciaCardiaca: 80,
  frecuenciaRespiratoria: 16,
  presionSistolica: 120,
  presionDiastolica: 80,
  saturacionOxigeno: 97,
});

test('Signos vitales estables: se guarda, se crea la nota automática y no hay alerta', async () => {
  const { bus, internaciones, notas, caso } = signosCaso();
  await internaciones.create({
    pacienteId: 2, fechaIngreso: '2026-02-01', motivoIngreso: 'x', estado: 'ACTIVA',
  });
  const r = await caso.ejecutar(signos(36.8));
  assert.equal(r.alerta, false);
  assert.match(notas.items[0].contenido, /realizados con éxito/);
  assert.equal(notas.items[0].pacienteId, 2);
  assert.equal(bus.de(DomainEvents.SIGNOS_VITALES_REGISTRADO).length, 1);
  assert.equal(bus.de(DomainEvents.SIGNOS_VITALES_ALERTA).length, 0);
});

test('Temperatura > 39 °C: queda marcado como alerta y avisa al médico con el sector', async () => {
  const { bus, internaciones, notas, caso } = signosCaso();
  await internaciones.create({
    pacienteId: 2, fechaIngreso: '2026-02-01', motivoIngreso: 'x', estado: 'ACTIVA', camaId: 15,
  });
  const r = await caso.ejecutar(signos(39.4));
  assert.equal(r.alerta, true);
  const [alerta] = bus.de(DomainEvents.SIGNOS_VITALES_ALERTA);
  assert.equal(alerta.temperatura, 39.4);
  assert.equal(alerta.sector, 'Clínica médica');
  assert.equal(alerta.camaId, 15);
  assert.match(notas.items[0].contenido, /ALERTA/);
  assert.equal(bus.de(DomainEvents.SIGNOS_VITALES_REGISTRADO)[0].alerta, true);
});

test('Exactamente 39 °C no genera alerta y una internación finalizada rechaza el registro', async () => {
  const { bus, internaciones, caso } = signosCaso();
  await internaciones.create({
    pacienteId: 2, fechaIngreso: '2026-02-01', motivoIngreso: 'x', estado: 'ACTIVA',
  });
  assert.equal((await caso.ejecutar(signos(39))).alerta, false);
  assert.equal(bus.de(DomainEvents.SIGNOS_VITALES_ALERTA).length, 0);

  await internaciones.update(1, { estado: 'FINALIZADA' });
  await assert.rejects(() => caso.ejecutar(signos(37)), /finalizada/);
});

// ---------- Recursos y Camas ----------

class CamasFalsas implements ICamaRepository {
  camas: Cama[] = [{ id: 15, numero: '101', habitacion_id: 1, estado: 'Libre', version: 0 }];
  asignaciones: { cama_id: number; paciente_id: number; fecha_liberacion: string | null }[] = [];

  async crear() { return this.camas[0]; }
  async buscarPorId(id: number) { return this.camas.find((c) => c.id === id) ?? null; }
  async buscarMapa() { return []; }

  async asignar(i: { camaId: number; pacienteId: number; usuarioId: number; version: number }) {
    const cama = this.camas.find((c) => c.id === i.camaId);
    if (!cama) return { ok: false as const, fallo: 'no_encontrada' as const };
    if (cama.version !== i.version) return { ok: false as const, fallo: 'version' as const };
    if (cama.estado !== 'Libre') return { ok: false as const, fallo: 'transicion' as const };
    const anterior = cama.estado;
    cama.estado = 'Ocupada';
    cama.version++;
    const fecha = new Date().toISOString();
    this.asignaciones.push({ cama_id: cama.id, paciente_id: i.pacienteId, fecha_liberacion: null });
    return {
      ok: true as const,
      cama: { ...cama },
      historial: { id: 1, cama_id: cama.id, estado_anterior: anterior, estado_nuevo: 'Ocupada' as EstadoCama, fecha_cambio: fecha, usuario_id: i.usuarioId },
      asignacion: { id: 1, cama_id: cama.id, paciente_id: i.pacienteId, fecha_asignacion: fecha, fecha_liberacion: null },
    };
  }

  async cambiarEstado(i: { camaId: number; estadoNuevo: EstadoCama; usuarioId: number; version?: number }) {
    const cama = this.camas.find((c) => c.id === i.camaId);
    if (!cama) return { ok: false as const, fallo: 'no_encontrada' as const };
    if (i.version !== undefined && cama.version !== i.version) return { ok: false as const, fallo: 'version' as const };
    if (!transicionDirectaPermitida(cama.estado, i.estadoNuevo)) return { ok: false as const, fallo: 'transicion' as const };
    const anterior = cama.estado;
    cama.estado = i.estadoNuevo;
    cama.version++;
    return {
      ok: true as const,
      cama: { ...cama },
      historial: { id: 2, cama_id: cama.id, estado_anterior: anterior, estado_nuevo: i.estadoNuevo, fecha_cambio: new Date().toISOString(), usuario_id: i.usuarioId },
      asignacion: null,
    };
  }
}

function camaService(bus: IEventBus, repo = new CamasFalsas()) {
  const service = new CamaService(
    repo,
    { findById: async () => ({ id: 1, numero: '1', piso: '1', sector: 'Clínica médica' }) } as never,
    new AdaptadorEventosRecursosCamas(bus),
  );
  return { service, repo };
}

test('Asignar cama publica CAMA_ASIGNADA y CAMA_ESTADO_CAMBIADO', async () => {
  const bus = new BusFalso();
  const { service } = camaService(bus);
  await service.asignar(15, { paciente_id: 2, usuario_id: 1, version: 0 });
  assert.equal(bus.de(DomainEvents.CAMA_ASIGNADA)[0].pacienteId, 2);
  const cambio = bus.de(DomainEvents.CAMA_ESTADO_CAMBIADO)[0];
  assert.equal(cambio.estadoAnterior, 'Libre');
  assert.equal(cambio.estadoNuevo, 'Ocupada');
});

test('Solo se asigna cama a pacientes ingresados (verificador de Enfermería)', async () => {
  const bus = new BusFalso();
  const { service, repo } = camaService(bus);
  service.definirVerificadorIngreso({ tieneInternacionActiva: async () => false });
  await assert.rejects(
    () => service.asignar(15, { paciente_id: 2, usuario_id: 1, version: 0 }),
    /internación activa/,
  );
  assert.equal(repo.camas[0].estado, 'Libre');
});

test('Dos asignaciones simultáneas: solo la primera gana, la segunda recibe conflicto', async () => {
  const bus = new BusFalso();
  const { service } = camaService(bus);
  const resultados = await Promise.allSettled([
    service.asignar(15, { paciente_id: 2, usuario_id: 1, version: 0 }),
    service.asignar(15, { paciente_id: 3, usuario_id: 2, version: 0 }),
  ]);
  assert.equal(resultados.filter((r) => r.status === 'fulfilled').length, 1);
  assert.equal(resultados.filter((r) => r.status === 'rejected').length, 1);
});

test('liberarPorAlta pasa la cama ocupada a "En limpieza" sin exigir versión y es idempotente', async () => {
  const bus = new BusFalso();
  const { service, repo } = camaService(bus);
  await service.asignar(15, { paciente_id: 2, usuario_id: 1, version: 0 });

  const r = await service.liberarPorAlta(15, 7);
  assert.equal(r?.cama.estado, 'En limpieza');
  assert.equal(repo.camas[0].estado, 'En limpieza');
  assert.equal(await service.liberarPorAlta(15, 7), null); // evento repetido: no falla
  assert.equal(await service.obtenerSector(15), 'Clínica médica');
});

// ---------- Cadena completa por el bus ----------

test('Flujo completo: ingreso → internación + protocolo → cama → medicación/insumo → alta → cama en limpieza', async () => {
  const bus = new BusFalso();
  const internaciones = new InternacionesMemoria();
  const protocolos = new ProtocolosRepositoryMemoria();
  const eventos = new EventosEnfermeriaBus(bus);
  const registrar = new RegistrarInternacion(internaciones, {
    generarProtocolo: new GenerarProtocoloDeIngreso(protocolos),
    eventos,
  });
  const vincular = new VincularCamaAInternacion(internaciones);
  const finalizar = new FinalizarInternacion(internaciones, eventos);
  const { service: camas, repo: camasRepo } = camaService(bus);
  camas.definirVerificadorIngreso({
    tieneInternacionActiva: async (id) =>
      (await internaciones.findByPacienteId(id)).some((i) => i.estado === 'ACTIVA'),
  });

  // Wiring equivalente a initSubscribers
  bus.subscribe(DomainEvents.PACIENTE_INGRESADO, async (e) => {
    await registrar.ejecutar({
      pacienteId: e.pacienteId,
      fechaIngreso: e.timestamp.toISOString().split('T')[0],
      motivoIngreso: e.motivoIngreso,
      estado: 'ACTIVA',
      tipoIngreso: e.tipoIngreso,
      observaciones: e.diagnosticoInicial,
    });
  });
  bus.subscribe(DomainEvents.CAMA_ASIGNADA, async (e) => {
    await vincular.ejecutar(e.pacienteId, e.camaId);
  });
  bus.subscribe(DomainEvents.PACIENTE_DADO_DE_ALTA, async (e) => {
    if (e.camaId !== undefined) await camas.liberarPorAlta(e.camaId, e.usuarioId);
  });

  // 1. Admisión confirma el ingreso por neumonía
  const admision = new IngresoInternacionService(
    { findById: async (id: number) => ({ id, activo: true }) } as never,
    bus,
  );
  await admision.confirmarIngreso({
    pacienteId: 2, motivoIngreso: 'Neumonía', diagnosticoInicial: 'Neumonía',
  });
  await bus.idle();

  const [internacion] = await internaciones.findAll();
  assert.equal(internacion.tipoIngreso, 'INFECCION_RESPIRATORIA');
  const [protocolo] = await protocolos.findByInternacionId(internacion.id);
  assert.ok(protocolo.pasos.includes('Monitoreo de saturación de oxígeno continuo'));

  // 2. Recursos asigna la cama y Enfermería la guarda en la internación
  await camas.asignar(15, { paciente_id: 2, usuario_id: 1, version: 0 });
  await bus.idle();
  assert.equal((await internaciones.findById(internacion.id))?.camaId, 15);

  // 3. Enfermería administra una dosis → evento para descontar insumo
  const administrar = new AdministrarDosis(
    medicacionesFalsas(), internaciones, new AdministracionesMemoria(), eventos,
  );
  await administrar.ejecutar({ medicacionId: 1, enfermeroId: 22, programadaPara: enMinutos(0) });
  assert.equal(bus.de(DomainEvents.MEDICACION_ADMINISTRADA).length, 1);

  // 4. Alta: la cama pasa sola a "En limpieza" y no admite nuevas asignaciones
  await finalizar.ejecutar(internacion.id, 9);
  await bus.idle();
  assert.equal(camasRepo.camas[0].estado, 'En limpieza');
  assert.equal(bus.de(DomainEvents.PACIENTE_DADO_DE_ALTA)[0].camaId, 15);
  await assert.rejects(() => camas.asignar(15, { paciente_id: 3, usuario_id: 1, version: camasRepo.camas[0].version }));
});
