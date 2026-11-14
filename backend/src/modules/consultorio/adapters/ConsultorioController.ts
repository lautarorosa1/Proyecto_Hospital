import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../../../shared/errors';
import { OcupacionService } from '../application/OcupacionService';
import { AgendaConsultorioService } from '../application/AgendaConsultorioService';
import { NotificacionService } from '../application/NotificacionService';

export class ConsultorioController {
  constructor(
    private readonly ocupaciones: OcupacionService,
    private readonly agenda: AgendaConsultorioService,
    private readonly notificaciones: NotificacionService,
  ) {}

  private id(raw: unknown, campo: string): number {
    const n = Number(raw);
    if (!Number.isInteger(n) || n <= 0) {
      throw new BadRequestError(`${campo} debe ser un entero positivo`);
    }
    return n;
  }

  private texto(raw: unknown): string | undefined {
    return typeof raw === 'string' && raw !== '' ? raw : undefined;
  }

  // ---------- Consultorios (habitaciones) ----------

  consultorios = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await this.ocupaciones.listarConsultorios());
    } catch (err) {
      next(err);
    }
  };

  abrir = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(201).json(await this.ocupaciones.abrir(req.body));
    } catch (err) {
      next(err);
    }
  };

  ocupacionActual = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({ ocupacion: await this.ocupaciones.actual(this.id(req.params.profesionalId, 'profesionalId')) });
    } catch (err) {
      next(err);
    }
  };

  cerrar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await this.ocupaciones.cerrar(this.id(req.params.profesionalId, 'profesionalId')));
    } catch (err) {
      next(err);
    }
  };

  // ---------- Turnos del profesional ----------

  getAgenda = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(
        await this.agenda.agenda(
          this.id(req.params.profesionalId, 'profesionalId'),
          this.texto(req.query.fecha),
        ),
      );
    } catch (err) {
      next(err);
    }
  };

  getSalaEspera = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(
        await this.agenda.salaEspera(
          this.id(req.params.profesionalId, 'profesionalId'),
          this.texto(req.query.fecha),
        ),
      );
    } catch (err) {
      next(err);
    }
  };

  atender = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(
        await this.agenda.atender(
          this.id(req.params.profesionalId, 'profesionalId'),
          this.id(req.params.turnoId, 'turnoId'),
        ),
      );
    } catch (err) {
      next(err);
    }
  };

  // ---------- Notificaciones ----------

  getNotificaciones = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limite = req.query.limite === undefined ? undefined : this.id(req.query.limite, 'limite');
      res.json(
        await this.notificaciones.listar(this.id(req.params.profesionalId, 'profesionalId'), {
          soloNoLeidas: req.query.soloNoLeidas === 'true',
          limite,
        }),
      );
    } catch (err) {
      next(err);
    }
  };

  leerNotificacion = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.notificaciones.marcarLeida(
        this.id(req.params.profesionalId, 'profesionalId'),
        this.id(req.params.notificacionId, 'notificacionId'),
      );
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  leerTodas = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(
        await this.notificaciones.marcarTodasLeidas(this.id(req.params.profesionalId, 'profesionalId')),
      );
    } catch (err) {
      next(err);
    }
  };
}
