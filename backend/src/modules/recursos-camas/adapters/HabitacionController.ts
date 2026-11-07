import { Request, Response, NextFunction } from 'express';
import { IHabitacionService } from '../application/IHabitacionService';
import { CreateHabitacionDto } from '../application/dtos/CreateHabitacionDto';
import { UpdateHabitacionDto } from '../application/dtos/UpdateHabitacionDto';
import { BadRequestError } from '../../../shared/errors';

type IdParams = { id: string };

export class HabitacionController {
  constructor(private readonly habitacionService: IHabitacionService) {}

  private parseId(raw: string): number {
    const id = Number(raw);
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestError('El id debe ser un entero positivo');
    }
    return id;
  }

  getAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const habitaciones = await this.habitacionService.getAll();
      res.json(habitaciones);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request<IdParams>, res: Response, next: NextFunction) => {
    try {
      const habitacion = await this.habitacionService.getById(this.parseId(req.params.id));
      res.json(habitacion);
    } catch (err) {
      next(err);
    }
  };

  create = async (
    req: Request<Record<string, never>, unknown, CreateHabitacionDto>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const habitacion = await this.habitacionService.create(req.body);
      res.status(201).json(habitacion);
    } catch (err) {
      next(err);
    }
  };

  update = async (
    req: Request<IdParams, unknown, UpdateHabitacionDto>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const habitacion = await this.habitacionService.update(
        this.parseId(req.params.id),
        req.body,
      );
      res.json(habitacion);
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request<IdParams>, res: Response, next: NextFunction) => {
    try {
      await this.habitacionService.remove(this.parseId(req.params.id));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}