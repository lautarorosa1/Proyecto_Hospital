import { Request, Response, NextFunction } from 'express';
import { IAuthService } from '../application/IAuthService';
import { LoginDto } from '../application/dtos/LoginDto';
import { RegisterUsuarioDto } from '../application/dtos/RegisterUsuarioDto';
import {
  AssignRolesDto,
  CreateRolDto,
  UpdateRolDto,
  UpdateUsuarioDto,
} from '../application/dtos/AuthResponseDto';
import { AppError, BadRequestError } from '../../../shared/errors';

export class AuthController {
  constructor(private readonly authService: IAuthService) {}

  private parseNumericId(raw: string, label = 'id'): number {
    const num = Number(raw);
    if (!Number.isInteger(num) || num <= 0) {
      throw new BadRequestError(`El parámetro ${label} debe ser un entero positivo`);
    }
    return num;
  }

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

  getRoles = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const roles = await this.authService.getAllRoles();
      res.status(200).json(roles);
    } catch (err) {
      next(err);
    }
  };

  createRol = async (
    req: Request<Record<string, never>, unknown, CreateRolDto>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const creado = await this.authService.createRol(req.body);
      res.status(201).json(creado);
    } catch (err) {
      next(err);
    }
  };

  updateRol = async (
    req: Request<{ id: string }, unknown, UpdateRolDto>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const rolId = this.parseNumericId(req.params.id, 'id');
      const actualizado = await this.authService.updateRol(rolId, req.body);
      res.status(200).json(actualizado);
    } catch (err) {
      next(err);
    }
  };

  deleteRol = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const rolId = this.parseNumericId(req.params.id, 'id');
      await this.authService.deleteRol(rolId);
      res.status(200).json({ message: 'Rol eliminado correctamente' });
    } catch (err) {
      next(err);
    }
  };

  getUsuarios = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const usuarios = await this.authService.getAllUsuarios();
      res.status(200).json(usuarios);
    } catch (err) {
      next(err);
    }
  };

  getUsuarioById = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const usuario = await this.authService.getUsuarioById(req.params.id);
      res.status(200).json(usuario);
    } catch (err) {
      next(err);
    }
  };

  updateUsuario = async (
    req: Request<{ id: string }, unknown, UpdateUsuarioDto>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const actualizado = await this.authService.updateUsuario(
        req.params.id,
        req.body,
      );
      res.status(200).json(actualizado);
    } catch (err) {
      next(err);
    }
  };

  toggleEstadoUsuario = async (
    req: Request<{ id: string }, unknown, { activo?: boolean }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const actualizado = await this.authService.toggleEstadoUsuario(
        req.params.id,
        req.body?.activo,
      );
      res.status(200).json(actualizado);
    } catch (err) {
      next(err);
    }
  };

  assignRoles = async (
    req: Request<{ id: string }, unknown, AssignRolesDto>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const actualizado = await this.authService.assignRoles(
        req.params.id,
        req.body,
      );
      res.status(200).json(actualizado);
    } catch (err) {
      next(err);
    }
  };

  removeRol = async (
    req: Request<{ id: string; rolId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const rolId = this.parseNumericId(req.params.rolId, 'rolId');
      const actualizado = await this.authService.removeRol(
        req.params.id,
        rolId,
      );
      res.status(200).json(actualizado);
    } catch (err) {
      next(err);
    }
  };
}
