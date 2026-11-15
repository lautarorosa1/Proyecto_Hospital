import { Request, Response } from 'express';
import { RegistrarInternacion } from '../application/RegistrarInternacion';
import { ConsultarInternaciones } from '../application/ConsultarInternaciones';
import { FinalizarInternacion } from '../application/FinalizarInternacion';
import { statusDe } from '../../../shared/errors';

export class InternacionController {
  constructor(
    private readonly registrarInternacion: RegistrarInternacion,
    private readonly consultarInternaciones: ConsultarInternaciones,
    private readonly finalizarInternacion: FinalizarInternacion
  ) {}

  private mensaje(error: unknown, porDefecto: string): string {
    return error instanceof Error ? error.message : porDefecto;
  }

  private parseId(raw: string): number | null {
    const id = Number(raw);
    return Number.isInteger(id) && id > 0 ? id : null;
  }

  // Registrar una internación (por la misma vía que el ingreso desde Admisión:
  // genera el protocolo de cuidados según el tipo de ingreso)
  async crear(req: Request, res: Response): Promise<void> {
    try {
      const internacion = await this.registrarInternacion.ejecutar(req.body);

      res.status(201).json({
        mensaje: 'Internación registrada correctamente.',
        data: internacion,
      });
    } catch (error) {
      res.status(statusDe(error, 400)).json({
        error: this.mensaje(error, 'Error al registrar la internación.'),
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
        error: this.mensaje(error, 'Error al consultar las internaciones.'),
      });
    }
  }

  // Obtener una internación por ID
  async obtener(req: Request, res: Response): Promise<void> {
    const id = this.parseId(String(req.params.id));
    if (id === null) {
      res.status(400).json({ error: 'El ID debe ser un número positivo.' });
      return;
    }

    try {
      const internacion = await this.consultarInternaciones.porId(id);
      res.status(200).json({ data: internacion });
    } catch (error) {
      res.status(statusDe(error, 500)).json({
        error: this.mensaje(error, 'Error al consultar la internación.'),
      });
    }
  }

  // Alta médica: finaliza la internación y libera la cama (evento PACIENTE_DADO_DE_ALTA)
  async finalizar(req: Request, res: Response): Promise<void> {
    const id = this.parseId(String(req.params.id));
    if (id === null) {
      res.status(400).json({ error: 'El ID debe ser un número positivo.' });
      return;
    }

    const usuarioId = req.body?.usuarioId;
    if (
      usuarioId !== undefined &&
      (!Number.isInteger(usuarioId) || usuarioId <= 0)
    ) {
      res.status(400).json({ error: 'usuarioId debe ser un entero positivo.' });
      return;
    }

    try {
      const internacion = await this.finalizarInternacion.ejecutar(id, usuarioId);
      res.status(200).json({
        mensaje: 'Alta registrada correctamente.',
        data: internacion,
      });
    } catch (error) {
      const mensaje = this.mensaje(error, 'Error al finalizar la internación.');
      const noEncontrada = mensaje === 'No se encontró la internación.';
      const status = statusDe(error, noEncontrada ? 404 : 409);
      res.status(status).json({ error: mensaje });
    }
  }
}
