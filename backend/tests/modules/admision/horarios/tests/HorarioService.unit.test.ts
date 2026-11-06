import { test } from 'node:test';
import assert from 'node:assert/strict';

import { HorarioService } from '../../../../../src/modules/admision/horarios/application/HorarioService';
import type { IHorarioRepository } from '../../../../../src/modules/admision/horarios/domain/IHorarioRepository';
import type { IProfesionalRepository } from '../../../../../src/modules/admision/profesionales/domain/IProfesionalRepository';
import { BadRequestError } from '../../../../../src/shared/errors';

test('guarda rangos sin superposición y rechaza rangos superpuestos', async () => {
  let guardados: { id: number; profesionalId: number; diaSemana: number; horaDesde: string; horaHasta: string }[] = [];
  const horarios: IHorarioRepository = {
    findByProfesional: async () => guardados,
    findByProfesionalYDia: async () => guardados,
    reemplazar: async (profesionalId, datos) => {
      guardados = datos.map((dato, index) => ({ ...dato, id: index + 1, profesionalId }));
      return guardados;
    },
  };
  const profesionales = {
    findAll: async () => [],
    findById: async () => ({
      id: 1,
      usuarioId: 1,
      especialidadId: 1,
      nombre: 'Profesional',
      apellido: 'Prueba',
      dni: '12345678',
      email: 'test@example.com',
      matricula: 'MN-1',
      tipoProfesional: 'medico' as const,
      duracionTurnoMin: 30,
      estado: 'activo' as const,
    }),
    findByDni: async () => null,
    findByEmail: async () => null,
    findByMatricula: async () => null,
    findByUsuarioId: async () => null,
    create: async () => { throw new Error('No esperado en esta prueba'); },
    update: async () => null,
  } as IProfesionalRepository;
  const service = new HorarioService(horarios, profesionales);

  const resultado = await service.guardar(1, {
    horarios: [
      { diaSemana: 1, horaDesde: '09:00', horaHasta: '10:00' },
      { diaSemana: 1, horaDesde: '10:00', horaHasta: '10:30' },
    ],
  });
  assert.equal(resultado.length, 2);

  await assert.rejects(
    () => service.guardar(1, {
      horarios: [
        { diaSemana: 1, horaDesde: '09:00', horaHasta: '10:00' },
        { diaSemana: 1, horaDesde: '09:30', horaHasta: '10:30' },
      ],
    }),
    BadRequestError,
  );
});
