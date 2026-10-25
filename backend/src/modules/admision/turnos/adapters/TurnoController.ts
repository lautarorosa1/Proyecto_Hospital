import { Request, Response, NextFunction } from 'express';
import { ITurnoService } from '../application/ITurnoService';
import { CrearTurnoDto } from '../application/dtos/CrearTurnoDto';
import { CrearEntreturnoDto } from '../application/dtos/CrearEntreturnoDto';
import { ReservarTurnoDto } from '../application/dtos/ReservarTurnoDto';
import { FiltrosTurnoDto } from '../application/dtos/FiltrosTurnoDto';
import { BadRequestError } from '../../../../shared/errors';

type IdParams = { id: string };

export class TurnoController {
  constructor(private readonly turnoService: ITurnoService) {}

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

  private queryId(valor: unknown, campo: string): number | undefined {
    const texto = this.queryString(valor);
    return texto !== undefined ? this.parseId(texto, campo) : undefined;
  }

  private leerFiltros(req: Request): FiltrosTurnoDto {
    return {
      profesionalId: this.queryId(req.query.profesionalId, 'profesionalId'),
      pacienteId: this.queryId(req.query.pacienteId, 'pacienteId'),
      fecha: this.queryString(req.query.fecha),
      fechaDesde: this.queryString(req.query.fechaDesde),
      fechaHasta: this.queryString(req.query.fechaHasta),
      estado: this.queryString(req.query.estado),
    };
  }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await this.turnoService.getAll(this.leerFiltros(req)));
    } catch (err) {
      next(err);
    }
  };

  getDisponibles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await this.turnoService.getDisponibles(this.leerFiltros(req)));
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request<IdParams>, res: Response, next: NextFunction) => {
    try {
      res.json(await this.turnoService.getById(this.parseId(req.params.id)));
    } catch (err) {
      next(err);
    }
  };

  crear = async (
    req: Request<Record<string, never>, unknown, CrearTurnoDto>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const turno = await this.turnoService.crear(req.body);
      res.status(201).json(turno);
    } catch (err) {
      next(err);
    }
  };

  crearEntreturno = async (
    req: Request<Record<string, never>, unknown, CrearEntreturnoDto>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const resultado = await this.turnoService.crearEntreturno(req.body);
      res.status(201).json(resultado);
    } catch (err) {
      next(err);
    }
  };

  reservar = async (
    req: Request<IdParams, unknown, ReservarTurnoDto>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const turno = await this.turnoService.reservar(
        this.parseId(req.params.id),
        req.body,
      );
      res.json(turno);
    } catch (err) {
      next(err);
    }
  };

  confirmar = async (req: Request<IdParams>, res: Response, next: NextFunction) => {
    try {
      res.json(await this.turnoService.confirmar(this.parseId(req.params.id)));
    } catch (err) {
      next(err);
    }
  };

  registrarLlegada = async (req: Request<IdParams>, res: Response, next: NextFunction) => {
    try {
      res.json(await this.turnoService.registrarLlegada(this.parseId(req.params.id)));
    } catch (err) {
      next(err);
    }
  };

  atender = async (req: Request<IdParams>, res: Response, next: NextFunction) => {
    try {
      res.json(await this.turnoService.atender(this.parseId(req.params.id)));
    } catch (err) {
      next(err);
    }
  };

  cancelar = async (req: Request<IdParams>, res: Response, next: NextFunction) => {
    try {
      res.json(await this.turnoService.cancelar(this.parseId(req.params.id)));
    } catch (err) {
      next(err);
    }
  };
}
