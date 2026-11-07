import { test } from 'node:test';
import assert from 'node:assert/strict';

import { GuardiaService } from '../../../../../src/modules/admision/guardia/application/GuardiaService';
import type { IIngresoGuardiaRepository } from '../../../../../src/modules/admision/guardia/domain/IIngresoGuardiaRepository';
import type { IngresoGuardia } from '../../../../../src/modules/admision/guardia/domain/IngresoGuardia';
import type { IPacienteRepository } from '../../../../../src/modules/admision/pacientes/domain/IPacienteRepository';
import type { IProfesionalRepository } from '../../../../../src/modules/admision/profesionales/domain/IProfesionalRepository';
import type { IGuardiaNotificador } from '../../../../../src/modules/admision/guardia/domain/IGuardiaNotificador';
import { BadRequestError } from '../../../../../src/shared/errors';

test('registra ingreso con prioridad y posición calculadas', async () => {
  let ingresoGuardado: IngresoGuardia | undefined;
  const ingresos = {
    create: async (data: Omit<IngresoGuardia, 'id' | 'estado' | 'ingresadoEn'>) => {
      ingresoGuardado = { ...data, id: 7, estado: 'en_espera', ingresadoEn: new Date('2026-01-01T10:00:00Z') };
      return ingresoGuardado;
    },
    findById: async () => ingresoGuardado ?? null,
    findActivoByPaciente: async () => null,
    findCola: async () => ingresoGuardado ? [ingresoGuardado] : [],
  } as IIngresoGuardiaRepository;
  const pacientes = { findById: async (id: number) => id === 1 ? { id } : null } as IPacienteRepository;
  const profesionales = {
    findAll: async () => [],
    findById: async (id: number) => ({
      id,
      usuarioId: id,
      especialidadId: 1,
      nombre: 'Enfermero',
      apellido: 'Prueba',
      dni: '12345678',
      email: 'test@example.com',
      matricula: 'MN-1',
      tipoProfesional: 'enfermero' as const,
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
  const notificador: IGuardiaNotificador = { alertaRiesgoVital: async () => undefined };
  const service = new GuardiaService(ingresos, pacientes, profesionales, notificador);

  const result = await service.registrarIngreso({
    pacienteId: 1,
    enfermeroId: 2,
    nivelTriaje: 'verde',
    motivoConsulta: 'Control',
  });
  assert.equal(result.ingreso.id, 7);
  assert.equal(result.ingreso.posicion, 1);
  assert.equal(result.desplazados, 0);
});

test('rechaza un identificador inválido antes de consultar repositorios', async () => {
  const service = new GuardiaService(
    {} as IIngresoGuardiaRepository,
    {} as IPacienteRepository,
    {} as IProfesionalRepository,
    {} as IGuardiaNotificador,
  );
  await assert.rejects(
    () => service.registrarIngreso({
      pacienteId: 0,
      enfermeroId: 2,
      nivelTriaje: 'verde',
      motivoConsulta: 'Control',
    }),
    BadRequestError,
  );
});
