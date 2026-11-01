import { Request, Response, NextFunction } from 'express';
import { IInsumoService } from '../application/IInsumoService';
import { CreateInsumoDto } from '../application/dtos/CreateInsumoDto';
import { UpdateInsumoDto } from '../application/dtos/UpdateInsumoDto';
import { IngresarStockDto } from '../application/dtos/IngresarStockDto';
import { BadRequestError } from '../../../shared/errors';

type IdParams = { id: string };

export class InsumoController {
  constructor(private readonly insumoService: IInsumoService) {}

  private parseId(raw: string): number {
    const id = Number(raw);
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestError('El id debe ser un entero positivo');
    }
    return id;
  }

  getAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const insumos = await this.insumoService.getAll();
      res.json(insumos);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request<IdParams>, res: Response, next: NextFunction) => {
    try {
      const insumo = await this.insumoService.getById(this.parseId(req.params.id));
      res.json(insumo);
    } catch (err) {
      next(err);
    }
  };

  consultarStock = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const stock = await this.insumoService.consultarStock();
      res.json(stock);
    } catch (err) {
      next(err);
    }
  };

  consultarStockPorId = async (req: Request<IdParams>, res: Response, next: NextFunction) => {
    try {
      const stock = await this.insumoService.consultarStockPorId(this.parseId(req.params.id));
      res.json(stock);
    } catch (err) {
      next(err);
    }
  };

  create = async (
    req: Request<Record<string, never>, unknown, CreateInsumoDto>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const insumo = await this.insumoService.create(req.body);
      res.status(201).json(insumo);
    } catch (err) {
      next(err);
    }
  };

  update = async (
    req: Request<IdParams, unknown, UpdateInsumoDto>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const insumo = await this.insumoService.update(this.parseId(req.params.id), req.body);
      res.json(insumo);
    } catch (err) {
      next(err);
    }
  };

  ingresar = async (
    req: Request<IdParams, unknown, IngresarStockDto>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const resultado = await this.insumoService.ingresar(this.parseId(req.params.id), req.body);
      res.status(201).json(resultado);
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request<IdParams>, res: Response, next: NextFunction) => {
    try {
      await this.insumoService.remove(this.parseId(req.params.id));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}