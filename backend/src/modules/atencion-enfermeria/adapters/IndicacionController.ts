import { Request, Response } from 'express';

import { RegistrarIndicacion } from '../application/RegistrarIndicacion';
import { ConsultarIndicaciones } from '../application/ConsultarIndicaciones';
import { ActualizarIndicacion } from '../application/ActualizarIndicacion';

export class IndicacionController {
  constructor(
    private readonly registrar: RegistrarIndicacion,
    private readonly consultar: ConsultarIndicaciones,
    private readonly actualizarIndicacion: ActualizarIndicacion
  ) {}

  async crear(req: Request, res: Response): Promise<void> {
    try {
      const indicacion = await this.registrar.ejecutar(req.body);

      res.status(201).json(indicacion);
    } catch (error) {
      res.status(400).json({
        mensaje: error instanceof Error
          ? error.message
          : 'Error al registrar la indicación.',
      });
    }
  }

  async listar(req: Request, res: Response): Promise<void> {
    try {
      const indicaciones = await this.consultar.ejecutar();

      res.status(200).json(indicaciones);
    } catch (error) {
      res.status(500).json({
        mensaje: error instanceof Error
          ? error.message
          : 'Error al consultar las indicaciones.',
      });
    }
  }

  async listarPorInternacion(req: Request, res: Response): Promise<void> {
    try {
      const internacionId = Number(req.params.internacionId);

      const indicaciones = await this.consultar.buscarPorInternacion(internacionId);

      res.status(200).json(indicaciones);
    } catch (error) {
      res.status(400).json({
        mensaje: error instanceof Error
          ? error.message
          : 'Error al consultar las indicaciones.',
      });
    }
  }

  async actualizar(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);

      const indicacion = await this.actualizarIndicacion.ejecutar(id, req.body);

      res.status(200).json(indicacion);
    } catch (error) {
      res.status(400).json({
        mensaje: error instanceof Error
          ? error.message
          : 'Error al actualizar la indicación.',
      });
    }
  }
}