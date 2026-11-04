
import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';

import { PacienteEntity } from '../../admision/pacientes/infrastructure/PacienteEntity';
import { AlergiaEntity } from '../infrastructure/AlergiaEntity';

export const TestDataSource = new DataSource({
  type: 'postgres',

  host: process.env.DB_HOST || 'localhost',

  port: Number(process.env.DB_PORT || 5432),

  username: process.env.DB_USERNAME || 'postgres',

  password: process.env.DB_PASSWORD || 'postgres',

  database: 'Proyecto_Hospital_Test',

  synchronize: false,

  logging: false,

  entities: [
    PacienteEntity,
    AlergiaEntity
  ]
});