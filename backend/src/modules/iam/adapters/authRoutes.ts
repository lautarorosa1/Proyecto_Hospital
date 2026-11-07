import { Router } from 'express';
import { AuthController } from './AuthController';
import {
  authenticateJWT,
  authorizeRoles,
} from './middlewares/authMiddleware';

export function createAuthRoutes(authController: AuthController): Router {
  const router = Router();

  router.post('/register', authController.register);
  router.post('/login', authController.login);
  router.get('/me', authenticateJWT, authController.me);

  router.post('/auth/register', authController.register);
  router.post('/auth/login', authController.login);
  router.get('/auth/me', authenticateJWT, authController.me);
  router.get('/usuarios/me', authenticateJWT, authController.me);

  router.get(
    '/roles',
    authenticateJWT,
    authorizeRoles('Administrador'),
    authController.getRoles,
  );
  router.post(
    '/roles',
    authenticateJWT,
    authorizeRoles('Administrador'),
    authController.createRol,
  );
  router.put(
    '/roles/:id',
    authenticateJWT,
    authorizeRoles('Administrador'),
    authController.updateRol,
  );
  router.delete(
    '/roles/:id',
    authenticateJWT,
    authorizeRoles('Administrador'),
    authController.deleteRol,
  );

  router.get(
    '/usuarios',
    authenticateJWT,
    authorizeRoles('Administrador'),
    authController.getUsuarios,
  );
  router.get(
    '/usuarios/:id',
    authenticateJWT,
    authorizeRoles('Administrador'),
    authController.getUsuarioById,
  );
  router.put(
    '/usuarios/:id',
    authenticateJWT,
    authorizeRoles('Administrador'),
    authController.updateUsuario,
  );
  router.patch(
    '/usuarios/:id/estado',
    authenticateJWT,
    authorizeRoles('Administrador'),
    authController.toggleEstadoUsuario,
  );
  router.post(
    '/usuarios/:id/roles',
    authenticateJWT,
    authorizeRoles('Administrador'),
    authController.assignRoles,
  );
  router.delete(
    '/usuarios/:id/roles/:rolId',
    authenticateJWT,
    authorizeRoles('Administrador'),
    authController.removeRol,
  );

  return router;
}
