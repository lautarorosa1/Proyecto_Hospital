import type { Request, Response } from 'express';

import { RegistrarSignosVitales } from '../application/RegistrarSignosVitales';
import { ActualizarSignosVitales } from '../application/ActualizarSignosVitales';
import { EliminarSignosVitales } from '../application/EliminarSignosVitales';
import type { ISignosVitalesRepository } from '../domain/SignosVitalesRepository';

export class SignosVitalesController {
  constructor(
    private readonly registrarSignosVitales: RegistrarSignosVitales,
    private readonly signosVitalesRepository: ISignosVitalesRepository,
    private readonly actualizarSignosVitales: ActualizarSignosVitales,
    private readonly eliminarSignosVitales: EliminarSignosVitales
  ) {}

  // Registrar signos vitales
  registrar = async (req: Request, res: Response): Promise<void> => {
    try {
      const registro = await this.registrarSignosVitales.ejecutar(req.body);

      res.status(201).json(registro);
    } catch (error) {
      res.status(400).json({
        mensaje: error instanceof Error
          ? error.message
          : 'Error al registrar los signos vitales.',
      });
    }
  };

  // Buscar signos vitales por ID
  buscarPorId = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({
          mensaje: 'El ID debe ser un número positivo.',
        });
        return;
      }

      const registro = await this.signosVitalesRepository.findById(id);

      if (!registro) {
        res.status(404).json({
          mensaje: 'No se encontraron los signos vitales.',
        });
        return;
      }

      res.status(200).json(registro);
    } catch (error) {
      res.status(500).json({
        mensaje: error instanceof Error
          ? error.message
          : 'Error al consultar los signos vitales.',
      });
    }
  };

  // Buscar signos vitales por internación
  buscarPorInternacion = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const internacionId = Number(req.params.internacionId);

      if (!Number.isInteger(internacionId) || internacionId <= 0) {
        res.status(400).json({
          mensaje: 'El ID de la internación debe ser positivo.',
        });
        return;
      }

      const registros =
        await this.signosVitalesRepository.findByInternacionId(internacionId);

      res.status(200).json(registros);
    } catch (error) {
      res.status(500).json({
        mensaje: error instanceof Error
          ? error.message
          : 'Error al buscar los signos vitales.',
      });
    }
  };

  // Actualizar signos vitales
  actualizar = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);

      const registro = await this.actualizarSignosVitales.ejecutar(
        id,
        req.body
      );

      res.status(200).json(registro);
    } catch (error) {
      const mensaje = error instanceof Error
        ? error.message
        : 'Error al actualizar los signos vitales.';

      const noEncontrado =
        mensaje === 'No se encontraron los signos vitales.';

      res.status(noEncontrado ? 404 : 400).json({ mensaje });
    }
  };

  // Eliminar signos vitales
  eliminar = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);

      await this.eliminarSignosVitales.ejecutar(id);

      res.status(200).json({
        mensaje: 'Los signos vitales se eliminaron correctamente.',
      });
    } catch (error) {
      const mensaje = error instanceof Error
        ? error.message
        : 'Error al eliminar los signos vitales.';

      const noEncontrado =
        mensaje === 'No se encontraron los signos vitales.';

      res.status(noEncontrado ? 404 : 400).json({ mensaje });
    }
  };
}