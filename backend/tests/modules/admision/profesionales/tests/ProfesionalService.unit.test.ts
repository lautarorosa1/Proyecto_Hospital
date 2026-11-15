import { test } from 'node:test';
import assert from 'node:assert/strict';

import { ProfesionalService } from '../../../../../src/modules/admision/profesionales/application/ProfesionalService';
import type { IProfesionalRepository } from '../../../../../src/modules/admision/profesionales/domain/IProfesionalRepository';
import type { IUsuarioDirectorio } from '../../../../../src/modules/admision/profesionales/domain/IUsuarioDirectorio';
import type { Profesional } from '../../../../../src/modules/admision/profesionales/domain/Profesional';
import { BadRequestError, ConflictError } from '../../../../../src/shared/errors';

// Cuentas de acceso (IAM) que existen en la prueba: id uuid → email
const USUARIOS = [
  { id: 'uuid-luis', email: 'luis@example.com' },
  { id: 'uuid-ana', email: 'ana@example.com' },
];

function crearServicio(conDirectorio = true) {
  const profesionales: Profesional[] = [];
  const repository: IProfesionalRepository = {
    findAll: async () => profesionales,
    findById: async (id) => profesionales.find((p) => p.id === id) ?? null,
    findByDni: async (dni) => profesionales.find((p) => p.dni === dni) ?? null,
    findByEmail: async (email) => profesionales.find((p) => p.email === email) ?? null,
    findByMatricula: async (matricula) => profesionales.find((p) => p.matricula === matricula) ?? null,
    findByUsuarioId: async (usuarioId) => profesionales.find((p) => p.usuarioId === usuarioId) ?? null,
    create: async (data) => {
      const profesional = { ...data, id: profesionales.length + 1 };
      profesionales.push(profesional);
      return profesional;
    },
    update: async (id, data) => {
      const index = profesionales.findIndex((p) => p.id === id);
      if (index < 0) return null;
      profesionales[index] = { ...profesionales[index], ...data };
      return profesionales[index];
    },
  };
  const directorio: IUsuarioDirectorio = {
    findById: async (id) => USUARIOS.find((u) => u.id === id) ?? null,
    findByEmail: async (email) => USUARIOS.find((u) => u.email === email) ?? null,
  };
  return new ProfesionalService(repository, conDirectorio ? directorio : undefined);
}

const profesionalValido = {
  nombre: ' Luis ',
  apellido: ' Gómez ',
  dni: '12345678',
  email: ' LUIS@EXAMPLE.COM ',
  matricula: ' MN-123 ',
  tipoProfesional: 'medico' as const,
};

test('crea profesional normalizado y aplica duración y estado predeterminados', async () => {
  const service = crearServicio();
  const profesional = await service.create(profesionalValido);

  assert.equal(profesional.nombre, 'Luis');
  assert.equal(profesional.email, 'luis@example.com');
  assert.equal(profesional.duracionTurnoMin, 30);
  assert.equal(profesional.estado, 'activo');
});

test('no pide especialidad ni usuario para crear un profesional', async () => {
  const service = crearServicio(false);
  const profesional = await service.create(profesionalValido);

  assert.equal(profesional.usuarioId, null);
  assert.equal('especialidadId' in profesional, false);
});

test('sin elegir usuario, se vincula solo al usuario con el mismo email', async () => {
  const service = crearServicio();
  const profesional = await service.create(profesionalValido);

  assert.equal(profesional.usuarioId, 'uuid-luis');
});

test('queda sin usuario si no hay cuenta con ese email o ya está vinculada a otro profesional', async () => {
  const service = crearServicio();
  const sinCuenta = await service.create({ ...profesionalValido, email: 'otro@example.com' });
  assert.equal(sinCuenta.usuarioId, null);

  // uuid-ana ya está vinculada a otro profesional (con otro email)
  await service.create({
    ...profesionalValido,
    dni: '22222222',
    matricula: 'MN-222',
    email: 'x@example.com',
    usuarioId: 'uuid-ana',
  });
  const repetido = await service.create({
    ...profesionalValido,
    dni: '87654321',
    matricula: 'MN-999',
    email: 'ana@example.com',
  });
  assert.equal(repetido.usuarioId, null);
});

test('respeta el usuario elegido y rechaza uno inexistente o ya vinculado', async () => {
  const service = crearServicio();
  const elegido = await service.create({ ...profesionalValido, usuarioId: 'uuid-ana' });
  assert.equal(elegido.usuarioId, 'uuid-ana');

  await assert.rejects(
    () =>
      service.create({
        ...profesionalValido,
        dni: '87654321',
        matricula: 'MN-999',
        email: 'nuevo@example.com',
        usuarioId: 'uuid-no-existe',
      }),
    BadRequestError,
  );
  await assert.rejects(
    () =>
      service.create({
        ...profesionalValido,
        dni: '87654321',
        matricula: 'MN-999',
        email: 'nuevo@example.com',
        usuarioId: 'uuid-ana',
      }),
    ConflictError,
  );
});

test('al editar se puede vincular otro usuario o desvincular con null', async () => {
  const service = crearServicio();
  const creado = await service.create(profesionalValido); // uuid-luis

  const vinculado = await service.update(creado.id, { usuarioId: 'uuid-ana' });
  assert.equal(vinculado.usuarioId, 'uuid-ana');

  const desvinculado = await service.update(creado.id, { usuarioId: null });
  assert.equal(desvinculado.usuarioId, null);

  const intacto = await service.update(creado.id, { nombre: 'Luis Alberto' });
  assert.equal(intacto.usuarioId, null);
});

test('rechaza duración fuera de rango y matrícula duplicada', async () => {
  const service = crearServicio();
  await assert.rejects(
    () => service.create({ ...profesionalValido, duracionTurnoMin: 4 }),
    BadRequestError,
  );
  await service.create(profesionalValido);
  await assert.rejects(
    () =>
      service.create({
        ...profesionalValido,
        email: 'otro@example.com',
        dni: '87654321',
      }),
    ConflictError,
  );
});
