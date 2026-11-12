
import { Request, Response, NextFunction } from 'express';
import { CrearProtocolo } from '../application/protocolos/CrearProtocolo';
import { ConsultarProtocolos } from '../application/protocolos/ConsultarProtocolos';
import { ActualizarProtocolo } from '../application/protocolos/ActualizarProtocolo';
import { EliminarProtocolo } from '../application/protocolos/EliminarProtocolo';

type IdParams = { id: string };

export class ProtocoloController {
  constructor(
    private readonly crearProtocolo: CrearProtocolo,
    private readonly consultarProtocolos: ConsultarProtocolos,
    private readonly actualizarProtocolo: ActualizarProtocolo,
    private readonly eliminarProtocolo: EliminarProtocolo,
  ) {}

  private parseId(raw: string): number {
    const id = Number(raw);

    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('El ID debe ser un entero positivo.');
    }

    return id;
  }

  getAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const protocolos = await this.consultarProtocolos.consultarTodos();
      res.json(protocolos);
    } catch (err) {
      next(err);
    }
  };

  getById = async (
    req: Request<IdParams>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const protocolo = await this.consultarProtocolos.consultarPorId(
        this.parseId(req.params.id),
      );

      if (!protocolo) {
        res.status(404).json({ error: 'Protocolo no encontrado.' });
        return;
      }

      res.json(protocolo);
    } catch (err) {
      next(err);
    }
  };

  getByInternacion = async (
    req: Request<{ internacionId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const protocolos = await this.consultarProtocolos.consultarPorInternacion(
        this.parseId(req.params.internacionId),
      );
      res.json(protocolos);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const protocolo = await this.crearProtocolo.execute(req.body);
      res.status(201).json(protocolo);
    } catch (err) {
      next(err);
    }
  };

  update = async (
    req: Request<IdParams>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const protocolo = await this.actualizarProtocolo.execute(
        this.parseId(req.params.id),
        req.body,
      );

      if (!protocolo) {
        res.status(404).json({ error: 'Protocolo no encontrado.' });
        return;
      }

      res.json(protocolo);
    } catch (err) {
      next(err);
    }
  };

  remove = async (
    req: Request<IdParams>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const eliminado = await this.eliminarProtocolo.execute(
        this.parseId(req.params.id),
      );

      if (!eliminado) {
        res.status(404).json({ error: 'Protocolo no encontrado.' });
        return;
      }

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}