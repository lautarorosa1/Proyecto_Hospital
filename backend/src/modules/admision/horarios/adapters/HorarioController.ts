import { Request, Response, NextFunction } from 'express';
import { IHorarioService } from '../application/IHorarioService';
import { GuardarHorariosDto } from '../application/dtos/GuardarHorariosDto';
import { BadRequestError } from '../../../../shared/errors';

type ProfesionalParams = { profesionalId: string };

export class HorarioController {
  constructor(private readonly horarioService: IHorarioService) {}

  private parseId(raw: string): number {
    const id = Number(raw);
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestError('El id del profesional debe ser un entero positivo');
    }
    return id;
  }

  getByProfesional = async (
    req: Request<ProfesionalParams>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const horarios = await this.horarioService.getByProfesional(
        this.parseId(req.params.profesionalId),
      );
      res.json(horarios);
    } catch (err) {
      next(err);
    }
  };

  guardar = async (
    req: Request<ProfesionalParams, unknown, GuardarHorariosDto>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const horarios = await this.horarioService.guardar(
        this.parseId(req.params.profesionalId),
        req.body,
      );
      res.json(horarios);
    } catch (err) {
      next(err);
    }
  };
}
