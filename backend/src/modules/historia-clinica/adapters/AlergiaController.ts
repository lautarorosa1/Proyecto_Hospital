import { Request, Response, NextFunction } from 'express';
import { AlergiaService } from '../application/AlergiaService';
import type { Alergia } from '../domain/Alergia';
import { BadRequestError } from '../../../shared/errors';

type IdParams = { id: string };
type PacienteParams = { pacienteId: string };

type CreateAlergiaDto = Omit<Alergia, 'id' | 'fechaRegistro'>;

type UpdateAlergiaDto = Partial<
  Pick<Alergia, 'alergeno' | 'reaccion' | 'severidad'>
>;

export class AlergiaController {
  constructor(
    private readonly alergiaService: AlergiaService
  ) {}

  private parseId(raw: string): number {
    const id = Number(raw);

    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new BadRequestError('El id debe ser un entero positivo');
    }

    return id;
  }

  getByPaciente = async (
    req: Request<PacienteParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const alergias = await this.alergiaService.obtenerPorPaciente(
        this.parseId(req.params.pacienteId)
      );

      res.json(alergias);
    } catch (err) {
      next(err);
    }
  };

  getById = async (
    req: Request<IdParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const alergia = await this.alergiaService.obtenerPorId(
        this.parseId(req.params.id)
      );

      if (!alergia) {
        res.status(404).json({ error: 'Alergia no encontrada' });
        return;
      }

      res.json(alergia);
    } catch (err) {
      next(err);
    }
  };

  create = async (
    req: Request<Record<string, never>, unknown, CreateAlergiaDto>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const alergia = await this.alergiaService.registrar(req.body);
      res.status(201).json(alergia);
    } catch (err) {
      next(err);
    }
  };

  update = async (
    req: Request<IdParams, unknown, UpdateAlergiaDto>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const alergia = await this.alergiaService.actualizar(
        this.parseId(req.params.id),
        req.body
      );

      if (!alergia) {
        res.status(404).json({ error: 'Alergia no encontrada' });
        return;
      }

      res.json(alergia);
    } catch (err) {
      next(err);
    }
  };
}