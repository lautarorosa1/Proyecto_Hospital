import { Request, Response, NextFunction } from 'express';
import { EventoClinicoService } from '../application/EventoClinicoService';

export class EventoClinicoController {
  constructor(private readonly service: EventoClinicoService) {}

  getByPaciente = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(
        await this.service.obtenerLineaDeTiempo(Number(req.params.pacienteId)),
      );
    } catch (err) {
      next(err);
    }
  };
}
