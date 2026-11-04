import { test } from 'node:test';
import assert from 'node:assert/strict';

import { TestDataSource } from './test-data-source';
import { AlergiaEntity } from '../infrastructure/AlergiaEntity';
import { AlergiaRepository } from '../infrastructure/AlergiaRepository';

test('Prueba de integración del repositorio de Alergias', async (t) => {
  await TestDataSource.initialize();

  const repoTypeORM = TestDataSource.getRepository(AlergiaEntity);
  const alergiaRepository = new AlergiaRepository(repoTypeORM);

  const idsCreados: number[] = [];

  async function crearAlergia() {
    const alergia = await alergiaRepository.create({
      pacienteId: 1,
      alergeno: 'Penicilina',
      reaccion: 'Erupción cutánea',
      severidad: 'alta'
    });

    idsCreados.push(alergia.id);
    return alergia;
  }

  try {
    await t.test('Registra y consulta una alergia', async () => {
      const alergia = await crearAlergia();

      const encontrada = await alergiaRepository.findById(alergia.id);

      assert.ok(encontrada);
      assert.equal(encontrada.alergeno, 'Penicilina');
      assert.equal(encontrada.pacienteId, 1);

      const alergiasPaciente =
        await alergiaRepository.findByPacienteId(1);

      assert.ok(alergiasPaciente.some(a => a.id === alergia.id));
    });

    await t.test('Actualiza una alergia existente', async () => {
      const alergia = await crearAlergia();

      const actualizada = await alergiaRepository.update(alergia.id, {
        alergeno: 'Polen',
        reaccion: 'Estornudos',
        severidad: 'moderada'
      });

      assert.ok(actualizada);
      assert.equal(actualizada.alergeno, 'Polen');
      assert.equal(actualizada.reaccion, 'Estornudos');
      assert.equal(actualizada.severidad, 'moderada');

      const encontrada = await alergiaRepository.findById(alergia.id);

      assert.equal(encontrada?.alergeno, 'Polen');
    });

    await t.test('Elimina una alergia existente', async () => {
      const alergia = await crearAlergia();

      const eliminada = await alergiaRepository.delete(alergia.id);

      assert.equal(eliminada, true);

      const encontrada = await alergiaRepository.findById(alergia.id);

      assert.equal(encontrada, null);
    });
  } finally {
    // Limpiamos los registros creados durante las pruebas
    for (const id of idsCreados) {
      await alergiaRepository.delete(id);
    }

    await TestDataSource.destroy();
  }
});