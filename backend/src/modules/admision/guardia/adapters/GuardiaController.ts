import { Request, Response, NextFunction } from 'express';
import { IGuardiaService } from '../application/IGuardiaService';
import { RegistrarIngresoDto } from '../application/dtos/RegistrarIngresoDto';
import { BadRequestError } from '../../../../shared/errors';

type IdParams = { id: string };

export class GuardiaController {
  constructor(private readonly guardiaService: IGuardiaService) {}

  private parseId(raw: string, campo = 'El id'): number {
    const id = Number(raw);
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestError(`${campo} debe ser un entero positivo`);
    }
    return id;
  }

  registrarIngreso = async (
    req: Request<Record<string, never>, unknown, RegistrarIngresoDto>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const resultado = await this.guardiaService.registrarIngreso(req.body);
      res.status(201).json(resultado);
    } catch (err) {
      next(err);
    }
  };

  getIngreso = async (
    req: Request<IdParams>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      res.json(await this.guardiaService.getIngreso(this.parseId(req.params.id)));
    } catch (err) {
      next(err);
    }
  };

  getCola = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await this.guardiaService.getCola());
    } catch (err) {
      next(err);
    }
  };
}
