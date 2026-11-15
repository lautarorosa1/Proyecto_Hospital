import { Request, Response, NextFunction } from 'express';
import { EstudioMedicoService } from '../application/EstudioMedicoService';
import type { CamposEditablesEstudio } from '../domain/IEstudioMedicoRepository';
import { BadRequestError } from '../../../shared/errors';

type IdParams = { id: string };
type PacienteParams = { pacienteId: string };

type CreateEstudioDto = {
  pacienteId: number;
  fecha: string;
  tipoEstudio: string;
  descripcion: string;
  resultado?: string | null;
};

export class EstudioMedicoController {
  constructor(private readonly estudioService: EstudioMedicoService) {}

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
      const estudios = await this.estudioService.obtenerPorPaciente(
        this.parseId(req.params.pacienteId)
      );
      res.json(estudios);
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
      const estudio = await this.estudioService.obtenerPorId(
        this.parseId(req.params.id)
      );
      res.json(estudio);
    } catch (err) {
      next(err);
    }
  };

  create = async (
    req: Request<Record<string, never>, unknown, CreateEstudioDto>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const estudio = await this.estudioService.registrar(req.body);
      res.status(201).json(estudio);
    } catch (err) {
      next(err);
    }
  };

  update = async (
    req: Request<IdParams, unknown, CamposEditablesEstudio>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const estudio = await this.estudioService.actualizar(
        this.parseId(req.params.id),
        req.body
      );
      res.json(estudio);
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
      await this.estudioService.eliminar(this.parseId(req.params.id));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}