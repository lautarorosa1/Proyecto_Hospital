import { Router } from 'express';
import { AuthController } from './AuthController';
import { authenticateJWT } from './middlewares/authMiddleware';

export function createAuthRoutes(authController: AuthController): Router {
  const router = Router();

  router.post('/register', authController.register);
  router.post('/login', authController.login);
  router.get('/me', authenticateJWT, authController.me);

  router.post('/auth/register', authController.register);
  router.post('/auth/login', authController.login);
  router.get('/auth/me', authenticateJWT, authController.me);
  router.get('/usuarios/me', authenticateJWT, authController.me);

  return router;
}

