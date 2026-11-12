import { Request, Response } from 'express';
import { FacturacionService } from '../application/FacturacionService';
import { CalculadorFacturacionService } from '../application/CalculadorFacturacionService';

export class FacturacionController {
  private service = new FacturacionService();
  private calculador = new CalculadorFacturacionService();

  listarNomenclador = async (_req: Request, res: Response): Promise<void> => {
    try {
      await this.service.inicializarNomencladorSiVacio();
      const items = await this.service.listarNomenclador();
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  crearPrestacion = async (req: Request, res: Response): Promise<void> => {
    try {
      const { codigo, descripcion, precioBase } = req.body;
      if (!codigo || !descripcion || precioBase === undefined || isNaN(precioBase)) {
        res.status(400).json({ error: 'Código, descripción y precioBase numérico son obligatorios.' });
        return;
      }
      const creada = await this.service.crearPrestacion(codigo, descripcion, Number(precioBase));
      res.status(201).json(creada);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  simularCalculo = async (req: Request, res: Response): Promise<void> => {
    try {
      const { tipoCobertura, valorBase, copagoFijo, entidadNombre } = req.body;
      if (valorBase === undefined || isNaN(valorBase)) {
        res.status(400).json({ error: 'El valor base es obligatorio y debe ser numérico.' });
        return;
      }
      const resultado = this.calculador.calcular(
        tipoCobertura,
        Number(valorBase),
        copagoFijo !== undefined ? Number(copagoFijo) : undefined,
        entidadNombre
      );
      res.json(resultado);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  registrarCargo = async (req: Request, res: Response): Promise<void> => {
    try {
      const { pacienteId, codigoPrestacion, tipoCobertura, copagoFijo, entidadNombre, eventoOrigenId } = req.body;
      if (!pacienteId || !codigoPrestacion || !tipoCobertura) {
        res.status(400).json({ error: 'Faltan parámetros requeridos: pacienteId, codigoPrestacion o tipoCobertura.' });
        return;
      }
      const cargoGuardado = await this.service.registrarCargo({
        pacienteId: Number(pacienteId),
        codigoPrestacion,
        tipoCobertura,
        copagoFijo: copagoFijo !== undefined ? Number(copagoFijo) : undefined,
        entidadNombre,
        eventoOrigenId,
      });
      res.status(201).json(cargoGuardado);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  obtenerCuentaPaciente = async (req: Request, res: Response): Promise<void> => {
    try {
      const pacienteId = Number(req.params.pacienteId);
      if (isNaN(pacienteId)) {
        res.status(400).json({ error: 'Identificador de paciente inválido.' });
        return;
      }
      const cargos = await this.service.obtenerCargosPorPaciente(pacienteId);
      const totalAdeudadoPaciente = cargos
        .filter((c) => c.estado === 'PENDIENTE')
        .reduce((acum, c) => acum + Number(c.cargoPaciente), 0);
      const totalLiquidadoTerceros = cargos
        .filter((c) => c.estado === 'PENDIENTE')
        .reduce((acum, c) => acum + Number(c.cargoTercero), 0);

      res.json({
        pacienteId,
        totalAdeudadoPaciente,
        totalLiquidadoTerceros,
        cargos,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  liquidarCuenta = async (req: Request, res: Response): Promise<void> => {
    try {
      const pacienteId = Number(req.params.pacienteId);
      const { nombrePaciente } = req.body || {};
      if (isNaN(pacienteId)) {
        res.status(400).json({ error: 'Identificador de paciente inválido.' });
        return;
      }
      const facturas = await this.service.liquidarCuentaPaciente(pacienteId, nombrePaciente);
      res.status(201).json({
        mensaje: 'Cuenta liquidada y comprobantes emitidos correctamente.',
        facturas,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  listarFacturas = async (_req: Request, res: Response): Promise<void> => {
    try {
      const facturas = await this.service.listarFacturas();
      res.json(facturas);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}