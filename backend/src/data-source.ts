import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { join } from 'path';

// Configuración de conexión a PostgreSQL
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT
  ? Number(process.env.DB_PORT)
  : 5432;

const DB_USERNAME = process.env.DB_USERNAME || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || '12345';
const DB_NAME = process.env.DB_NAME || 'Proyecto_Hospital';

// Configuración de sincronización
const DB_SYNCHRONIZE =
  process.env.DB_SYNCHRONIZE !== undefined
    ? process.env.DB_SYNCHRONIZE === 'true'
    : true;

// Configuración de logs
const DB_LOGGING =
  process.env.DB_LOGGING !== undefined
    ? process.env.DB_LOGGING === 'true'
    : true;

// Conexión principal de TypeORM
export const AppDataSource = new DataSource({
  type: 'postgres',

  host: DB_HOST,
  port: DB_PORT,
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME,

  synchronize: DB_SYNCHRONIZE,
  logging: DB_LOGGING,

  // Entidades de todos los módulos del proyecto
  entities: [
    join(__dirname, 'modules', '**', 'infrastructure', '*Entity{.js,.ts}'),
  ],

  // Migraciones del proyecto
  migrations: [
    join(__dirname, 'migrations', '**', '*{.js,.ts}'),
  ],

  migrationsTableName: 'migrations',
});