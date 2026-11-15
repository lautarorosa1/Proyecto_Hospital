import { Request, Response, NextFunction } from 'express';
import { IngresoInternacionService } from '../application/IngresoInternacionService';

export class IngresoInternacionController {
  constructor(private readonly service: IngresoInternacionService) {}

  confirmar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 202: el ingreso queda confirmado y Enfermería lo procesa de forma asíncrona.
      res.status(202).json(await this.service.confirmarIngreso(req.body));
    } catch (err) {
      next(err);
    }
  };
}
