import { Request, Response, NextFunction } from 'express';
import { AntecedenteFamiliarService } from '../application/AntecedenteFamiliarService';
import type { AntecedenteFamiliar } from '../domain/AntecedenteFamiliar';
import { BadRequestError } from '../../../shared/errors';

type IdParams = { id: string };
type PacienteParams = { pacienteId: string };

type CreateAntecedenteDto = {
  pacienteId: number;
  parentesco: string;
  enfermedad: string;
  observaciones?: string | null;
};

type UpdateAntecedenteDto = Partial<
  Pick<AntecedenteFamiliar, 'parentesco' | 'enfermedad' | 'observaciones'>
>;

export class AntecedenteFamiliarController {
  constructor(
    private readonly antecedenteService: AntecedenteFamiliarService
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
      const antecedentes = await this.antecedenteService.obtenerPorPaciente(
        this.parseId(req.params.pacienteId)
      );
      res.json(antecedentes);
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
      const antecedente = await this.antecedenteService.obtenerPorId(
        this.parseId(req.params.id)
      );
      res.json(antecedente);
    } catch (err) {
      next(err);
    }
  };

  create = async (
    req: Request<Record<string, never>, unknown, CreateAntecedenteDto>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const antecedente = await this.antecedenteService.registrar(req.body);
      res.status(201).json(antecedente);
    } catch (err) {
      next(err);
    }
  };

  update = async (
    req: Request<IdParams, unknown, UpdateAntecedenteDto>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const antecedente = await this.antecedenteService.actualizar(
        this.parseId(req.params.id),
        req.body
      );
      res.json(antecedente);
    } catch (err) {
      next(err);
    }
  };

  delete = async (
    req: Request<IdParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.antecedenteService.eliminar(this.parseId(req.params.id));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}