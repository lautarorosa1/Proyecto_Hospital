import { test } from 'node:test';
import assert from 'node:assert/strict';

import { ProfesionalService } from '../../../../../src/modules/admision/profesionales/application/ProfesionalService';
import type { IProfesionalRepository } from '../../../../../src/modules/admision/profesionales/domain/IProfesionalRepository';
import type { Profesional } from '../../../../../src/modules/admision/profesionales/domain/Profesional';
import { BadRequestError, ConflictError } from '../../../../../src/shared/errors';

function crearServicio() {
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
  return new ProfesionalService(repository);
}

const profesionalValido = {
  usuarioId: 1,
  especialidadId: 1,
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

test('rechaza duración fuera de rango y matrícula duplicada', async () => {
  const service = crearServicio();
  await assert.rejects(
    () => service.create({ ...profesionalValido, duracionTurnoMin: 4 }),
    BadRequestError,
  );
  await service.create(profesionalValido);
  await assert.rejects(
    () => service.create({ ...profesionalValido, usuarioId: 2, dni: '87654321' }),
    ConflictError,
  );
});
