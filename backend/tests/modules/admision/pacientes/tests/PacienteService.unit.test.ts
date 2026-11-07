import { test } from 'node:test';
import assert from 'node:assert/strict';

import { PacienteService } from '../../../../../src/modules/admision/pacientes/application/PacienteService';
import type { IPacienteRepository } from '../../../../../src/modules/admision/pacientes/domain/IPacienteRepository';
import type { Paciente } from '../../../../../src/modules/admision/pacientes/domain/Paciente';
import { BadRequestError, ConflictError, NotFoundError } from '../../../../../src/shared/errors';

function crearServicio() {
  const pacientes: Paciente[] = [];
  const repository: IPacienteRepository = {
    findAll: async () => pacientes,
    findById: async (id) => pacientes.find((p) => p.id === id) ?? null,
    findByDni: async (dni) => pacientes.find((p) => p.dni === dni) ?? null,
    findByEmail: async (email) => pacientes.find((p) => p.email === email) ?? null,
    create: async (data) => {
      const paciente = { ...data, id: pacientes.length + 1 };
      pacientes.push(paciente);
      return paciente;
    },
    update: async (id, data) => {
      const index = pacientes.findIndex((p) => p.id === id);
      if (index < 0) return null;
      pacientes[index] = { ...pacientes[index], ...data };
      return pacientes[index];
    },
    delete: async (id) => {
      const index = pacientes.findIndex((p) => p.id === id);
      if (index < 0) return false;
      pacientes.splice(index, 1);
      return true;
    },
  };
  return new PacienteService(repository);
}

const pacienteValido = {
  nombre: ' Ana ',
  apellido: ' Pérez ',
  dni: '12345678',
  email: ' ANA@EXAMPLE.COM ',
  fechaNacimiento: '1990-05-10',
  telefono: ' 555-0100 ',
};

test('crea y normaliza un paciente usando el repositorio falso', async () => {
  const service = crearServicio();
  const paciente = await service.create(pacienteValido);

  assert.equal(paciente.nombre, 'Ana');
  assert.equal(paciente.apellido, 'Pérez');
  assert.equal(paciente.email, 'ana@example.com');
  assert.equal(paciente.telefono, '555-0100');
});

test('rechaza fecha imposible y duplicados', async () => {
  const service = crearServicio();
  await assert.rejects(
    () => service.create({ ...pacienteValido, fechaNacimiento: '2023-02-29' }),
    BadRequestError,
  );
  await service.create(pacienteValido);
  await assert.rejects(
    () => service.create({ ...pacienteValido, nombre: 'Otra' }),
    ConflictError,
  );
});

test('actualiza datos y reporta pacientes inexistentes', async () => {
  const service = crearServicio();
  const paciente = await service.create(pacienteValido);

  const actualizado = await service.update(paciente.id, { nombre: 'Beatriz' });
  assert.equal(actualizado.nombre, 'Beatriz');
  await assert.rejects(() => service.getById(99), NotFoundError);
  await assert.rejects(() => service.remove(99), NotFoundError);
});
