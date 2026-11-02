import { Request, Response, NextFunction } from 'express';
import { ICamaService } from '../application/ICamaService';
import { AsignarCamaDto } from '../application/dtos/AsignarCamaDto';
import { CambiarEstadoCamaDto } from '../application/dtos/CambiarEstadoCamaDto';
import { CreateCamaDto } from '../application/dtos/CreateCamaDto';
import { PasarALimpiezaDto } from '../application/dtos/PasarALimpiezaDto';
import { BadRequestError } from '../../../shared/errors';

type IdParams = { id: string };

export class CamaController {
  constructor(private readonly camaService: ICamaService) {}

  private parseId(raw: string): number {
    const id = Number(raw);
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestError('El id debe ser un entero positivo');
    }
    return id;
  }

  private queryTexto(valor: unknown, campo: string): string | undefined {
    if (valor === undefined) return undefined;
    if (typeof valor !== 'string') {
      throw new BadRequestError(`El ${campo} debe ser un texto`);
    }
    return valor;
  }

  mapa = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const camas = await this.camaService.mapa({
        estado: this.queryTexto(req.query.estado, 'estado'),
        sector: this.queryTexto(req.query.sector, 'sector'),
      });
      res.json(camas);
    } catch (err) {
      next(err);
    }
  };

  obtener = async (req: Request<IdParams>, res: Response, next: NextFunction) => {
    try {
      const cama = await this.camaService.obtener(this.parseId(req.params.id));
      res.json(cama);
    } catch (err) {
      next(err);
    }
  };

  crear = async (
    req: Request<Record<string, never>, unknown, CreateCamaDto>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const cama = await this.camaService.crear(req.body);
      res.status(201).json(cama);
    } catch (err) {
      next(err);
    }
  };

  asignar = async (
    req: Request<IdParams, unknown, AsignarCamaDto>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const resultado = await this.camaService.asignar(this.parseId(req.params.id), req.body);
      res.status(201).json(resultado);
    } catch (err) {
      next(err);
    }
  };

  cambiarEstado = async (
    req: Request<IdParams, unknown, CambiarEstadoCamaDto>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const resultado = await this.camaService.cambiarEstado(
        this.parseId(req.params.id),
        req.body,
      );
      res.json(resultado);
    } catch (err) {
      next(err);
    }
  };

  pasarAEnLimpieza = async (
    req: Request<IdParams, unknown, PasarALimpiezaDto>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const resultado = await this.camaService.pasarAEnLimpieza(
        this.parseId(req.params.id),
        req.body,
      );
      res.json(resultado);
    } catch (err) {
      next(err);
    }
  };
}