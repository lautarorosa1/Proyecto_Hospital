import { test } from 'node:test';
import assert from 'node:assert/strict';

import { CamaService } from '../../../../src/modules/recursos-camas/application/CamaService';
import { HabitacionService } from '../../../../src/modules/recursos-camas/application/HabitacionService';
import { InsumoService } from '../../../../src/modules/recursos-camas/application/InsumoService';
import type { ICamaRepository } from '../../../../src/modules/recursos-camas/domain/ICamaRepository';
import type { IHabitacionRepository } from '../../../../src/modules/recursos-camas/domain/IHabitacionRepository';
import type { IInsumoRepository } from '../../../../src/modules/recursos-camas/domain/IInsumoRepository';
import type { IInventarioRepository } from '../../../../src/modules/recursos-camas/domain/IInventarioRepository';
import type { IPublicadorEstadoCama } from '../../../../src/modules/recursos-camas/domain/IEventosRecursosCamas';
import type { UpdateInsumoDto } from '../../../../src/modules/recursos-camas/application/dtos/UpdateInsumoDto';
import { BadRequestError } from '../../../../src/shared/errors';

test('CamaService valida la habitación y normaliza el número', async () => {
  let numeroGuardado = '';
  const camaRepository = {
    crear: async (data: { numero: string; habitacion_id: number }) => {
      numeroGuardado = data.numero;
      return { id: 1, ...data, estado: 'Libre' as const, version: 0 };
    },
  } as ICamaRepository;
  const habitaciones = {
    findAll: async () => [],
    findById: async () => ({ id: 2, numero: '2', piso: '1', sector: 'A' }),
    create: async () => ({ id: 2, numero: '2', piso: '1', sector: 'A' }),
    update: async () => null,
    delete: async () => false,
  } as IHabitacionRepository;
  const service = new CamaService(
    camaRepository,
    habitaciones,
    {} as IPublicadorEstadoCama,
  );

  const cama = await service.crear({ numero: '  C-1  ', habitacion_id: 2 });
  assert.equal(cama.numero, 'C-1');
  assert.equal(numeroGuardado, 'C-1');
});

test('HabitacionService crea datos limpios y rechaza campos vacíos', async () => {
  const repository = {
    findAll: async () => [],
    findById: async () => null,
    create: async (data: { numero: string; piso: string; sector: string }) => ({ id: 1, ...data }),
    update: async () => null,
    delete: async () => false,
  } as IHabitacionRepository;
  const service = new HabitacionService(repository);

  const result = await service.create({ numero: ' 10 ', piso: ' 2 ', sector: ' Norte ' });
  assert.deepEqual(result, { id: 1, numero: '10', piso: '2', sector: 'Norte' });
  await assert.rejects(
    () => service.create({ numero: ' ', piso: '2', sector: 'Norte' }),
    BadRequestError,
  );
});

test('InsumoService separa la modificación de stock y los ingresos', async () => {
  const repository = {
    findAll: async () => [],
    findById: async () => null,
    create: async (data: { nombre: string; stock_actual: number; unidad_medida: string }) => ({ id: 1, ...data }),
    update: async () => null,
    delete: async () => false,
  } as IInsumoRepository;
  const service = new InsumoService(repository, {} as IInventarioRepository);

  const insumo = await service.create({
    nombre: ' Guantes ',
    stock_actual: 0,
    unidad_medida: ' cajas ',
  });
  assert.equal(insumo.nombre, 'Guantes');
  assert.equal(insumo.stock_actual, 0);
  await assert.rejects(
    () => service.update(1, { stock_actual: 5 } as UpdateInsumoDto & { stock_actual: number }),
    BadRequestError,
  );
});
