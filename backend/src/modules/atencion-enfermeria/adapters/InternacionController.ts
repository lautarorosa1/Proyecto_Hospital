
import { Request, Response } from 'express';
import { RegistrarInternacion } from '../application/RegistrarInternacion';
import { ConsultarInternaciones } from '../application/ConsultarInternaciones';

export class InternacionController {
  constructor(
    private readonly registrarInternacion: RegistrarInternacion,
    private readonly consultarInternaciones: ConsultarInternaciones
  ) {}

  // Registrar una internación
  async crear(req: Request, res: Response): Promise<void> {
    try {
      const internacion = await this.registrarInternacion.ejecutar(req.body);

      res.status(201).json({
        mensaje: 'Internación registrada correctamente.',
        data: internacion,
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error
          ? error.message
          : 'Error al registrar la internación.',
      });
    }
  }

  // Listar todas las internaciones
  async listar(req: Request, res: Response): Promise<void> {
    try {
      const internaciones = await this.consultarInternaciones.ejecutar();

      res.status(200).json({
        mensaje: 'Internaciones obtenidas correctamente.',
        data: internaciones,
      });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error
          ? error.message
          : 'Error al consultar las internaciones.',
      });
    }
  }
}