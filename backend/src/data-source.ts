// src/data-source.ts
import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { PacienteEntity } from './modules/pacientes/infrastructure/PacienteEntity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: true,
  entities: [PacienteEntity],
  migrations: [__dirname + '/migrations/**/*{.js,.ts}'],
  migrationsTableName: 'migrations',
});