import { test } from 'node:test';
import assert from 'node:assert/strict';

import { TurnoService } from '../../../../../src/modules/admision/turnos/application/TurnoService';
import type { ITurnoRepository } from '../../../../../src/modules/admision/turnos/domain/ITurnoRepository';
import type { IProfesionalRepository } from '../../../../../src/modules/admision/profesionales/domain/IProfesionalRepository';
import type { IPacienteRepository } from '../../../../../src/modules/admision/pacientes/domain/IPacienteRepository';
import type { IHorarioRepository } from '../../../../../src/modules/admision/horarios/domain/IHorarioRepository';
import type { ITurnoNotificador } from '../../../../../src/modules/admision/turnos/domain/ITurnoNotificador';
import { BadRequestError } from '../../../../../src/shared/errors';

test('solicita turnos disponibles sin alterar el estado de otros filtros', async () => {
  let filtrosRecibidos: Record<string, unknown> | undefined;
  const turnos = {
    findAll: async (filtros: Record<string, unknown>) => {
      filtrosRecibidos = filtros;
      return [];
    },
  } as unknown as ITurnoRepository;
  const service = new TurnoService(
    turnos,
    { findAll: async () => [] } as unknown as IProfesionalRepository,
    {} as IPacienteRepository,
    {} as IHorarioRepository,
    {} as ITurnoNotificador,
  );

  assert.deepEqual(await service.getDisponibles({ profesionalId: 3 }), []);
  assert.equal(filtrosRecibidos?.profesionalId, 3);
  assert.equal(filtrosRecibidos?.estado, 'disponible');
  assert.ok(filtrosRecibidos?.desde);
});

test('rechaza filtros con identificadores inválidos', async () => {
  const service = new TurnoService(
    {} as ITurnoRepository,
    {} as IProfesionalRepository,
    {} as IPacienteRepository,
    {} as IHorarioRepository,
    {} as ITurnoNotificador,
  );
  await assert.rejects(() => service.getAll({ profesionalId: 0 }), BadRequestError);
});
