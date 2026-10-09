import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432;
const DB_USERNAME = process.env.DB_USERNAME || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
const DB_NAME = process.env.DB_NAME || 'Proyecto_Hospital';

const DB_SYNCHRONIZE = process.env.DB_SYNCHRONIZE !== undefined
  ? process.env.DB_SYNCHRONIZE === 'true'
  : true;

const DB_LOGGING = process.env.DB_LOGGING !== undefined
  ? process.env.DB_LOGGING === 'true'
  : true;

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: DB_HOST,
  port: DB_PORT,
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME,
  synchronize: DB_SYNCHRONIZE,
  logging: DB_LOGGING,
  entities: [__dirname + '/modules/**/infrastructure/*Entity{.js,.ts}'],
  migrations: [__dirname + '/migrations/**/*{.js,.ts}'],
  migrationsTableName: 'migrations',
});