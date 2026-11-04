import { test } from 'node:test';
import assert from 'node:assert/strict';

import { AlergiaService } from '../application/AlergiaService';
import type { IAlergiaRepository } from '../domain/IAlergiaRepository';
import type { IPacienteRepository } from '../../admision/pacientes/domain/IPacienteRepository';
import type { Alergia } from '../domain/Alergia';
import { BadRequestError, NotFoundError } from '../../../shared/errors';

function crearServicio() {
  const alergias: Alergia[] = [];

  const alergiaRepository = {
    findByPacienteId: async (pacienteId: number) =>
      alergias.filter(a => a.pacienteId === pacienteId),

    findById: async (id: number) =>
      alergias.find(a => a.id === id) ?? null,

    create: async (data: Omit<Alergia, 'id' | 'fechaRegistro'>) => {
      const alergia: Alergia = {
        ...data,
        id: alergias.length + 1,
        fechaRegistro: new Date()
      };

      alergias.push(alergia);
      return alergia;
    },

    update: async () => null,
    delete: async () => false
  } as IAlergiaRepository;

  const pacienteRepository = {
    findById: async (id: number) =>
      id === 1 ? { id: 1 } : null
  } as IPacienteRepository;

  return new AlergiaService(
    alergiaRepository,
    pacienteRepository
  );
}

test('Registra una alergia válida', async () => {
  const service = crearServicio();

  const alergia = await service.registrar({
    pacienteId: 1,
    alergeno: 'Penicilina',
    reaccion: 'Erupción cutánea',
    severidad: 'alta'
  });

  assert.equal(alergia.alergeno, 'Penicilina');
  assert.equal(alergia.pacienteId, 1);
  assert.equal(alergia.severidad, 'alta');
});

test('Rechaza una alergia sin alérgeno', async () => {
  const service = crearServicio();

  await assert.rejects(
    () => service.registrar({
      pacienteId: 1,
      alergeno: '',
      reaccion: 'Picazón',
      severidad: 'leve'
    }),
    BadRequestError
  );
});

test('Rechaza una severidad inválida', async () => {
  const service = crearServicio();

  await assert.rejects(
    () => service.registrar({
      pacienteId: 1,
      alergeno: 'Polen',
      reaccion: 'Estornudos',
      severidad: 'extrema' as Alergia['severidad']
    }),
    BadRequestError
  );
});

test('Rechaza un paciente inexistente', async () => {
  const service = crearServicio();

  await assert.rejects(
    () => service.registrar({
      pacienteId: 9999,
      alergeno: 'Polen',
      reaccion: 'Estornudos',
      severidad: 'leve'
    }),
    NotFoundError
  );
});

test('Consulta las alergias de un paciente', async () => {
  const service = crearServicio();

  await service.registrar({
    pacienteId: 1,
    alergeno: 'Látex',
    reaccion: 'Irritación',
    severidad: 'moderada'
  });

  const resultado = await service.obtenerPorPaciente(1);

  assert.equal(resultado.length, 1);
  assert.equal(resultado[0].alergeno, 'Látex');
});

test('Devuelve 404 si la alergia no existe', async () => {
  const service = crearServicio();

  await assert.rejects(
    () => service.obtenerPorId(9999),
    NotFoundError
  );
});