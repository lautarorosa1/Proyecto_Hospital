
import type { Request, Response } from 'express';

import { RegistrarMedicacion } from '../application/RegistrarMedicacion';
import { ConsultarMedicaciones } from '../application/ConsultarMedicaciones';
import { ActualizarMedicacion } from '../application/ActualizarMedicacion';
import { statusDe } from '../../../shared/errors';

export class MedicacionController {
  constructor(
    private readonly registrarMedicacion: RegistrarMedicacion,
    private readonly consultarMedicaciones: ConsultarMedicaciones,
    private readonly actualizarMedicacion: ActualizarMedicacion
  ) {}

  registrar = async (req: Request, res: Response): Promise<void> => {
    try {
      const medicacion = await this.registrarMedicacion.ejecutar(req.body);

      res.status(201).json(medicacion);
    } catch (error) {
      res.status(statusDe(error, 400)).json({
        mensaje: error instanceof Error ? error.message : 'Error al registrar la medicación.',
      });
    }
  };

  listar = async (_req: Request, res: Response): Promise<void> => {
    try {
      const medicaciones = await this.consultarMedicaciones.ejecutar();

      res.status(200).json(medicaciones);
    } catch (error) {
      res.status(500).json({
        mensaje: error instanceof Error ? error.message : 'Error al consultar las medicaciones.',
      });
    }
  };

  buscarPorInternacion = async (req: Request, res: Response): Promise<void> => {
    try {
      const internacionId = Number(req.params.internacionId);

      const medicaciones = await this.consultarMedicaciones.buscarPorInternacion(
        internacionId
      );

      res.status(200).json(medicaciones);
    } catch (error) {
      res.status(400).json({
        mensaje: error instanceof Error ? error.message : 'Error al buscar las medicaciones.',
      });
    }
  };

  actualizar = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);

      const medicacion = await this.actualizarMedicacion.ejecutar(
        id,
        req.body
      );

      if (!medicacion) {
        res.status(404).json({
          mensaje: 'No se encontró la medicación.',
        });
        return;
      }

      res.status(200).json(medicacion);
    } catch (error) {
      res.status(400).json({
        mensaje: error instanceof Error ? error.message : 'Error al actualizar la medicación.',
      });
    }
  };
}