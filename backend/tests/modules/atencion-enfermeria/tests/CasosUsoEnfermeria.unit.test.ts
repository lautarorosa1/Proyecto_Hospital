import { test } from 'node:test';
import assert from 'node:assert/strict';

import { RegistrarIndicacion } from '../../../../src/modules/atencion-enfermeria/application/RegistrarIndicacion';
import { RegistrarMedicacion } from '../../../../src/modules/atencion-enfermeria/application/RegistrarMedicacion';
import { ActualizarIndicacion } from '../../../../src/modules/atencion-enfermeria/application/ActualizarIndicacion';
import { ActualizarMedicacion } from '../../../../src/modules/atencion-enfermeria/application/ActualizarMedicacion';
import { ConsultarIndicaciones } from '../../../../src/modules/atencion-enfermeria/application/ConsultarIndicaciones';
import { ConsultarMedicaciones } from '../../../../src/modules/atencion-enfermeria/application/ConsultarMedicaciones';
import { FinalizarInternacion } from '../../../../src/modules/atencion-enfermeria/application/FinalizarInternacion';
import type { IIndicacionesRepository } from '../../../../src/modules/atencion-enfermeria/domain/IndicacionesRepository';
import type { IMedicacionesRepository } from '../../../../src/modules/atencion-enfermeria/domain/MedicacionesRepository';
import type { IInternacionRepository } from '../../../../src/modules/atencion-enfermeria/domain/InternacionRepository';
import type { Indicacion } from '../../../../src/modules/atencion-enfermeria/domain/Indicaciones';
import type { Medicacion } from '../../../../src/modules/atencion-enfermeria/domain/Medicaciones';
import type { Internacion } from '../../../../src/modules/atencion-enfermeria/domain/Internaciones';

const indicacion: Indicacion = {
  id: 1,
  internacionId: 2,
  profesionalId: 3,
  descripcion: 'Control de signos vitales',
  fecha: '2026-01-01',
  estado: 'ACTIVA',
};

const medicacion: Medicacion = {
  id: 1,
  internacionId: 2,
  profesionalId: 3,
  nombre: 'Paracetamol',
  dosis: '500 mg',
  frecuencia: 'Cada 8 horas',
  viaAdministracion: 'Oral',
  fechaInicio: '2026-01-01',
  estado: 'ACTIVA',
};

test('RegistrarIndicacion valida y envía la indicación al repositorio falso', async () => {
  let creada: Indicacion | undefined;
  const repo = {
    create: async (data: Omit<Indicacion, 'id'>) => (creada = { ...data, id: 1 }),
  } as IIndicacionesRepository;
  const result = await new RegistrarIndicacion(repo).ejecutar({
    internacionId: 2,
    profesionalId: 3,
    descripcion: 'Control de signos vitales',
    fecha: '2026-01-01',
    estado: 'ACTIVA',
  });
  assert.equal(result.id, 1);
  assert.equal(creada?.descripcion, indicacion.descripcion);
});

test('RegistrarMedicacion rechaza campos obligatorios vacíos', async () => {
  const service = new RegistrarMedicacion({} as IMedicacionesRepository);
  await assert.rejects(
    () => service.ejecutar({
      internacionId: medicacion.internacionId,
      profesionalId: medicacion.profesionalId,
      nombre: '',
      dosis: medicacion.dosis,
      frecuencia: medicacion.frecuencia,
      viaAdministracion: medicacion.viaAdministracion,
      fechaInicio: medicacion.fechaInicio,
      estado: medicacion.estado,
    }),
    /El nombre del medicamento es obligatorio/,
  );
});

test('ActualizarIndicacion y ActualizarMedicacion conservan el resultado del repositorio', async () => {
  const indicaciones = {
    create: async (data: Omit<Indicacion, 'id'>) => ({ ...data, id: 1 }),
    findById: async () => indicacion,
    findByInternacionId: async () => [indicacion],
    findAll: async () => [indicacion],
    update: async (_id: number, data: Partial<Omit<Indicacion, 'id'>>) => ({ ...indicacion, ...data }),
  } as IIndicacionesRepository;
  const medicaciones = {
    create: async (data: Omit<Medicacion, 'id'>) => ({ ...data, id: 1 }),
    findById: async () => medicacion,
    findByInternacionId: async () => [medicacion],
    findAll: async () => [medicacion],
    update: async (_id: number, data: Partial<Omit<Medicacion, 'id'>>) => ({ ...medicacion, ...data }),
  } as IMedicacionesRepository;

  assert.equal(
    (await new ActualizarIndicacion(indicaciones).ejecutar(1, { descripcion: 'Nueva indicación' })).descripcion,
    'Nueva indicación',
  );
  assert.equal(
    (await new ActualizarMedicacion(medicaciones).ejecutar(1, { dosis: '1 g' })).dosis,
    '1 g',
  );
});

test('las consultas devuelven las listas provistas por sus repositorios', async () => {
  const indicaciones = {
    create: async (data: Omit<Indicacion, 'id'>) => ({ ...data, id: 1 }),
    findById: async () => indicacion,
    findAll: async () => [indicacion],
    findByInternacionId: async () => [indicacion],
    update: async () => indicacion,
  } as IIndicacionesRepository;
  const medicaciones = {
    create: async (data: Omit<Medicacion, 'id'>) => ({ ...data, id: 1 }),
    findById: async () => medicacion,
    findAll: async () => [medicacion],
    findByInternacionId: async () => [medicacion],
    update: async () => medicacion,
  } as IMedicacionesRepository;

  assert.deepEqual(await new ConsultarIndicaciones(indicaciones).ejecutar(), [indicacion]);
  assert.deepEqual(await new ConsultarMedicaciones(medicaciones).buscarPorInternacion(2), [medicacion]);
});

test('FinalizarInternacion persiste el estado final y una fecha de egreso', async () => {
  const activa: Internacion = {
    id: 4,
    pacienteId: 8,
    fechaIngreso: '2026-01-01',
    motivoIngreso: 'Observación',
    estado: 'ACTIVA',
  };
  let cambios: Partial<Internacion> | undefined;
  const repo = {
    create: async (data: Omit<Internacion, 'id'>) => ({ ...data, id: 5 }),
    findById: async () => activa,
    findByPacienteId: async () => [activa],
    findAll: async () => [activa],
    update: async (_id: number, data: Partial<Internacion>) => {
      cambios = data;
      return { ...activa, ...data };
    },
  } as IInternacionRepository;

  const finalizada = await new FinalizarInternacion(repo).ejecutar(4);
  assert.equal(finalizada.estado, 'FINALIZADA');
  assert.equal(cambios?.fechaEgreso, new Date().toISOString().split('T')[0]);
});
