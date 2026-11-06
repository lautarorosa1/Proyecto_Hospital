
import 'reflect-metadata';
import { DataSource } from 'typeorm';

import { PacienteEntity } from '../../../../src/modules/admision/pacientes/infrastructure/PacienteEntity';
import { AlergiaEntity } from '../../../../src/modules/historia-clinica/infrastructure/AlergiaEntity';

const requiredTestSetting = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} debe configurarse para ejecutar pruebas de integración`);
  }
  return value;
};

const database = requiredTestSetting('TEST_DB_NAME');
if (database !== 'Proyecto_Hospital_Test') {
  throw new Error('TEST_DB_NAME debe ser exactamente Proyecto_Hospital_Test');
}

const port = Number(requiredTestSetting('TEST_DB_PORT'));
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('TEST_DB_PORT debe ser un puerto válido');
}

export const TestDataSource = new DataSource({
  type: 'postgres',
  host: requiredTestSetting('TEST_DB_HOST'),
  port,
  username: requiredTestSetting('TEST_DB_USERNAME'),
  password: requiredTestSetting('TEST_DB_PASSWORD'),
  database,

  synchronize: false,

  logging: false,

  entities: [
    PacienteEntity,
    AlergiaEntity
  ]
});