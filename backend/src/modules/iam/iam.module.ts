import { AppDataSource } from '../../data-source';
import { UsuarioEntity } from './infrastructure/UsuarioEntity';
import { RolEntity } from './infrastructure/RolEntity';
import { UsuarioRepository } from './infrastructure/UsuarioRepository';
import { AuthService } from './application/AuthService';
import { AuthController } from './adapters/AuthController';
import { createAuthRoutes } from './adapters/authRoutes';

const usuarioRepository = new UsuarioRepository(
  AppDataSource.getRepository(UsuarioEntity),
  AppDataSource.getRepository(RolEntity),
);

const authService = new AuthService(usuarioRepository);
const authController = new AuthController(authService);

export const iamModule = {
  service: authService,
  controller: authController,
  routes: createAuthRoutes(authController),
};

