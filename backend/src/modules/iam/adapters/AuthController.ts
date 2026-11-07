import { Request, Response, NextFunction } from 'express';
import { IAuthService } from '../application/IAuthService';
import { LoginDto } from '../application/dtos/LoginDto';
import { RegisterUsuarioDto } from '../application/dtos/RegisterUsuarioDto';
import { AppError } from '../../../shared/errors';

export class AuthController {
  constructor(private readonly authService: IAuthService) {}

  register = async (
    req: Request<Record<string, never>, unknown, RegisterUsuarioDto>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await this.authService.register(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  login = async (
    req: Request<Record<string, never>, unknown, LoginDto>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await this.authService.login(req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Usuario no autenticado', 401);
      }
      const profile = await this.authService.getProfile(req.user.userId);
      res.status(200).json(profile);
    } catch (err) {
      next(err);
    }
  };
}

