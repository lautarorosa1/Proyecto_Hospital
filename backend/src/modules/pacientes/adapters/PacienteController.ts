import { Request, Response, NextFunction } from 'express';
import { IPacienteService } from '../application/IPacienteService';
import { CreatePacienteDto } from '../application/dtos/CreatePacienteDto';
import { UpdatePacienteDto } from '../application/dtos/UpdatePacienteDto';
import { BadRequestError } from '../../../shared/errors';

type IdParams = { id: string };

export class PacienteController {
  constructor(private readonly pacienteService: IPacienteService) {}

  private parseId(raw: string): number {
    const id = Number(raw);
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestError('El id debe ser un entero positivo');
    }
    return id;
  }

  getAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const pacientes = await this.pacienteService.getAll();
      res.json(pacientes);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request<IdParams>, res: Response, next: NextFunction) => {
    try {
      const paciente = await this.pacienteService.getById(
        this.parseId(req.params.id),
      );
      res.json(paciente);
    } catch (err) {
      next(err);
    }
  };

  create = async (
    req: Request<Record<string, never>, unknown, CreatePacienteDto>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const paciente = await this.pacienteService.create(req.body);
      res.status(201).json(paciente);
    } catch (err) {
      next(err);
    }
  };

  update = async (
    req: Request<IdParams, unknown, UpdatePacienteDto>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const paciente = await this.pacienteService.update(
        this.parseId(req.params.id),
        req.body,
      );
      res.json(paciente);
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request<IdParams>, res: Response, next: NextFunction) => {
    try {
      await this.pacienteService.remove(this.parseId(req.params.id));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}