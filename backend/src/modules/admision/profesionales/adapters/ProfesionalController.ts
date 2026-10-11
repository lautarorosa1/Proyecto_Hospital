import { Request, Response, NextFunction } from 'express';
import { IProfesionalService } from '../application/IProfesionalService';
import { CreateProfesionalDto } from '../application/dtos/CreateProfesionalDto';
import { UpdateProfesionalDto } from '../application/dtos/UpdateProfesionalDto';
import { FiltrosProfesionalDto } from '../application/dtos/FiltrosProfesionalDto';
import { BadRequestError } from '../../../../shared/errors';

type IdParams = { id: string };

export class ProfesionalController {
  constructor(private readonly profesionalService: IProfesionalService) {}

  private parseId(raw: string, campo = 'El id'): number {
    const id = Number(raw);
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestError(`${campo} debe ser un entero positivo`);
    }
    return id;
  }

  private queryString(valor: unknown): string | undefined {
    return typeof valor === 'string' && valor.trim() ? valor.trim() : undefined;
  }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const especialidadId = this.queryString(req.query.especialidadId);
      const filtros: FiltrosProfesionalDto = {
        estado: this.queryString(req.query.estado),
        tipoProfesional: this.queryString(req.query.tipoProfesional),
        especialidadId:
          especialidadId !== undefined
            ? this.parseId(especialidadId, 'especialidadId')
            : undefined,
      };
      const profesionales = await this.profesionalService.getAll(filtros);
      res.json(profesionales);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request<IdParams>, res: Response, next: NextFunction) => {
    try {
      const profesional = await this.profesionalService.getById(
        this.parseId(req.params.id),
      );
      res.json(profesional);
    } catch (err) {
      next(err);
    }
  };

  create = async (
    req: Request<Record<string, never>, unknown, CreateProfesionalDto>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const profesional = await this.profesionalService.create(req.body);
      res.status(201).json(profesional);
    } catch (err) {
      next(err);
    }
  };

  update = async (
    req: Request<IdParams, unknown, UpdateProfesionalDto>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const profesional = await this.profesionalService.update(
        this.parseId(req.params.id),
        req.body,
      );
      res.json(profesional);
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request<IdParams>, res: Response, next: NextFunction) => {
    try {
      await this.profesionalService.remove(this.parseId(req.params.id));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}
