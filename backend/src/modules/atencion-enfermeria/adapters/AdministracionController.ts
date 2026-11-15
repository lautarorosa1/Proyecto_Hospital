import type { Request, Response } from 'express';

import { AdministrarDosis } from '../application/AdministrarDosis';
import { ConsultarAdministraciones } from '../application/ConsultarAdministraciones';
import { statusDe } from '../../../shared/errors';

export class AdministracionController {
  constructor(
    private readonly administrarDosis: AdministrarDosis,
    private readonly consultarAdministraciones: ConsultarAdministraciones
  ) {}

  // Confirmar la administración de una dosis (descuenta el insumo del piso)
  administrar = async (req: Request, res: Response): Promise<void> => {
    try {
      const administracion = await this.administrarDosis.ejecutar(req.body);

      res.status(201).json(administracion);
    } catch (error) {
      res.status(statusDe(error, 400)).json({
        mensaje: error instanceof Error
          ? error.message
          : 'Error al registrar la administración.',
      });
    }
  };

  // Dosis administradas de una internación
  buscarPorInternacion = async (req: Request, res: Response): Promise<void> => {
    try {
      const administraciones =
        await this.consultarAdministraciones.buscarPorInternacion(
          Number(req.params.internacionId)
        );

      res.status(200).json(administraciones);
    } catch (error) {
      res.status(statusDe(error, 500)).json({
        mensaje: error instanceof Error
          ? error.message
          : 'Error al consultar las administraciones.',
      });
    }
  };
}
