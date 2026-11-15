
import { Request, Response, NextFunction } from 'express';

import { CrearNotaEnfermeria } from '../application/notas/CrearNotaEnfermeria';
import { ConsultarNotasEnfermeria } from '../application/notas/ConsultarNotasEnfermeria';
import { ActualizarNotaEnfermeria } from '../application/notas/ActualizarNotaEnfermeria';
import { EliminarNotaEnfermeria } from '../application/notas/EliminarNotaEnfermeria';

export class NotaEnfermeriaController {
  constructor(
    private readonly crearNota: CrearNotaEnfermeria,
    private readonly consultarNotas: ConsultarNotasEnfermeria,
    private readonly actualizarNota: ActualizarNotaEnfermeria,
    private readonly eliminarNota: EliminarNotaEnfermeria
  ) {}

  getAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const notas = await this.consultarNotas.consultarTodas();
      res.json(notas);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const nota = await this.consultarNotas.consultarPorId(id);

      if (!nota) {
        return res.status(404).json({ error: 'Nota no encontrada' });
      }

      res.json(nota);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { contenido, pacienteId, profesionalId, fecha } = req.body;

      if (
        typeof contenido !== 'string' ||
        !contenido.trim() ||
        !Number.isInteger(Number(pacienteId)) ||
        Number(pacienteId) <= 0 ||
        !Number.isInteger(Number(profesionalId)) ||
        Number(profesionalId) <= 0
      ) {
        return res.status(400).json({
          error: 'Contenido, pacienteId y profesionalId son obligatorios y deben ser válidos'
        });
      }

      const nota = await this.crearNota.ejecutar({
        contenido: contenido.trim(),
        pacienteId: Number(pacienteId),
        profesionalId: Number(profesionalId),
        fecha: fecha ? new Date(fecha) : new Date()
      });

      res.status(201).json(nota);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const nota = await this.actualizarNota.ejecutar(id, req.body);

      if (!nota) {
        return res.status(404).json({ error: 'Nota no encontrada' });
      }

      res.json(nota);
    } catch (error) {
      next(error);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const eliminada = await this.eliminarNota.ejecutar(id);

      if (!eliminada) {
        return res.status(404).json({ error: 'Nota no encontrada' });
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}