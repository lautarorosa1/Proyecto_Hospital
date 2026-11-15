import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  roles: string[];
  permisos: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function authenticateJWT(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticación requerido' });
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET || 'hospital_secret_dev_key';

  try {
    const decoded = jwt.verify(token, secret) as AuthenticatedUser;
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      roles: Array.isArray(decoded.roles) ? decoded.roles : [],
      permisos: Array.isArray(decoded.permisos) ? decoded.permisos : [],
    };
    return next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

export function authorizeRoles(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));
    if (!hasRole) {
      return res.status(403).json({
        error: 'Acceso denegado: no posee el rol requerido',
      });
    }

    return next();
  };
}

export function authorizePermission(requiredPermission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const hasPermission = req.user.permisos.includes(requiredPermission);
    if (!hasPermission) {
      return res.status(403).json({
        error: 'Acceso denegado: no posee el permiso requerido',
      });
    }

    return next();
  };
}

