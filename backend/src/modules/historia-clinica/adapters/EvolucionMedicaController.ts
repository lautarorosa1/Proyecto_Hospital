import { Request, Response, NextFunction } from 'express';
import { EvolucionMedicaService } from '../application/EvolucionMedicaService';
import type { CamposEditablesEvolucion } from '../domain/IEvolucionMedicaRepository';
import { BadRequestError } from '../../../shared/errors';

type IdParams = { id: string };
type PacienteParams = { pacienteId: string };

type CreateEvolucionDto = {
  pacienteId: number;
  fecha: string;
  motivoConsulta: string;
  observaciones: string;
  indicaciones?: string | null;
};

export class EvolucionMedicaController {
  constructor(private readonly evolucionService: EvolucionMedicaService) {}

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
      const evoluciones = await this.evolucionService.obtenerPorPaciente(
        this.parseId(req.params.pacienteId)
      );
      res.json(evoluciones);
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
      const evolucion = await this.evolucionService.obtenerPorId(
        this.parseId(req.params.id)
      );
      res.json(evolucion);
    } catch (err) {
      next(err);
    }
  };

  create = async (
    req: Request<Record<string, never>, unknown, CreateEvolucionDto>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const evolucion = await this.evolucionService.registrar(req.body);
      res.status(201).json(evolucion);
    } catch (err) {
      next(err);
    }
  };

  update = async (
    req: Request<IdParams, unknown, CamposEditablesEvolucion>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const evolucion = await this.evolucionService.actualizar(
        this.parseId(req.params.id),
        req.body
      );
      res.json(evolucion);
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
      await this.evolucionService.eliminar(this.parseId(req.params.id));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}