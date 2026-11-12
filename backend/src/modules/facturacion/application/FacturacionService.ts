import { AppDataSource } from '../../../data-source';
import { CargoFacturacion } from '../domain/entities/CargoFacturacion';
import { NomencladorPrestacion } from '../domain/entities/NomencladorPrestacion';
import { Factura } from '../domain/entities/Factura';
import { CalculadorFacturacionService } from './CalculadorFacturacionService';

export interface RegistrarCargoDTO {
  pacienteId: number;
  codigoPrestacion: string;
  tipoCobertura: 'PUBLICA' | 'PREPAGA' | 'PARTICULAR';
  copagoFijo?: number;
  entidadNombre?: string;
  eventoOrigenId?: string;
}

export class FacturacionService {
  private cargoRepo = AppDataSource.getRepository(CargoFacturacion);
  private nomencladorRepo = AppDataSource.getRepository(NomencladorPrestacion);
  private facturaRepo = AppDataSource.getRepository(Factura);
  private calculador = new CalculadorFacturacionService();

  async listarNomenclador(): Promise<NomencladorPrestacion[]> {
    return await this.nomencladorRepo.find({
      where: { activo: true },
      order: { codigo: 'ASC' },
    });
  }

  async crearPrestacion(codigo: string, descripcion: string, precioBase: number): Promise<NomencladorPrestacion> {
    const existente = await this.nomencladorRepo.findOne({ where: { codigo } });
    if (existente) {
      throw new Error(`Ya existe una prestación registrada con el código "${codigo}".`);
    }
    const nueva = this.nomencladorRepo.create({
      codigo: codigo.toUpperCase().trim(),
      descripcion: descripcion.trim(),
      precioBase,
      activo: true,
    });
    return await this.nomencladorRepo.save(nueva);
  }

  async registrarCargo(datos: RegistrarCargoDTO): Promise<CargoFacturacion> {
    // Control de idempotencia para eventos asíncronos de enfermería (HU 2.1)
    if (datos.eventoOrigenId) {
      const cargoPrevio = await this.cargoRepo.findOne({
        where: { eventoOrigenId: datos.eventoOrigenId },
      });
      if (cargoPrevio) {
        throw new Error(`El evento "${datos.eventoOrigenId}" ya fue procesado anteriormente (Cargo #${cargoPrevio.id}).`);
      }
    }

    const prestacion = await this.nomencladorRepo.findOne({
      where: { codigo: datos.codigoPrestacion, activo: true },
    });

    if (!prestacion) {
      throw new Error(`La prestación con código "${datos.codigoPrestacion}" no existe en el nomenclador.`);
    }

    const calculo = this.calculador.calcular(
      datos.tipoCobertura,
      Number(prestacion.precioBase),
      datos.copagoFijo,
      datos.entidadNombre
    );

    const nuevoCargo = this.cargoRepo.create({
      pacienteId: datos.pacienteId,
      concepto: prestacion.descripcion,
      valorBase: calculo.valorBase,
      tipoCobertura: calculo.tipoCobertura,
      cargoPaciente: calculo.cargoPaciente,
      cargoTercero: calculo.cargoTercero,
      enteAFacturar: calculo.enteAFacturar,
      estado: 'PENDIENTE',
      eventoOrigenId: datos.eventoOrigenId || undefined,
    });

    return await this.cargoRepo.save(nuevoCargo);
  }

  async obtenerCargosPorPaciente(pacienteId: number): Promise<CargoFacturacion[]> {
    return await this.cargoRepo.find({
      where: { pacienteId },
      order: { fechaCarga: 'DESC' },
    });
  }

  async liquidarCuentaPaciente(pacienteId: number, nombrePaciente?: string): Promise<Factura[]> {
    const cargosPendientes = await this.cargoRepo.find({
      where: { pacienteId, estado: 'PENDIENTE' },
    });

    if (cargosPendientes.length === 0) {
      throw new Error('El paciente no tiene cargos pendientes de liquidación.');
    }

    const facturasGeneradas: Factura[] = [];
    const totalPaciente = cargosPendientes.reduce((acc, c) => acc + Number(c.cargoPaciente), 0);

    // 1. Emitir factura al paciente si corresponde abonar copago o particular
    if (totalPaciente > 0) {
      const count = await this.facturaRepo.count();
      const facturaPaciente = this.facturaRepo.create({
        numeroComprobante: `FAC-P-${String(count + 1).padStart(6, '0')}`,
        pacienteId,
        tipoLiquidacion: 'PACIENTE',
        destinatario: nombrePaciente || `Paciente #${pacienteId}`,
        montoTotal: totalPaciente,
        estado: 'EMITIDA',
      });
      const guardada = await this.facturaRepo.save(facturaPaciente);
      facturasGeneradas.push(guardada);

      for (const cargo of cargosPendientes) {
        if (Number(cargo.cargoPaciente) > 0) {
          cargo.facturaId = guardada.id;
        }
      }
    }

    // 2. Agrupar y emitir liquidaciones a terceros (Prepagas / Estado)
    const mapaTerceros = new Map<string, number>();
    for (const cargo of cargosPendientes) {
      const montoTercero = Number(cargo.cargoTercero);
      if (montoTercero > 0) {
        const ente = cargo.enteAFacturar || 'Entidad Tercera';
        mapaTerceros.set(ente, (mapaTerceros.get(ente) || 0) + montoTercero);
      }
    }

    for (const [ente, montoTotal] of mapaTerceros.entries()) {
      const count = await this.facturaRepo.count();
      const facturaTercero = this.facturaRepo.create({
        numeroComprobante: `LIQ-T-${String(count + 1).padStart(6, '0')}`,
        pacienteId,
        tipoLiquidacion: 'TERCERO',
        destinatario: ente,
        montoTotal,
        estado: 'EMITIDA',
      });
      const guardada = await this.facturaRepo.save(facturaTercero);
      facturasGeneradas.push(guardada);

      for (const cargo of cargosPendientes) {
        if ((cargo.enteAFacturar || 'Entidad Tercera') === ente && Number(cargo.cargoTercero) > 0 && !cargo.facturaId) {
          cargo.facturaId = guardada.id;
        }
      }
    }

    // 3. Marcar todos los cargos procesados como FACTURADO
    for (const cargo of cargosPendientes) {
      cargo.estado = 'FACTURADO';
    }
    await this.cargoRepo.save(cargosPendientes);

    return facturasGeneradas;
  }

  async listarFacturas(): Promise<Factura[]> {
    return await this.facturaRepo.find({
      order: { fechaEmision: 'DESC' },
    });
  }

  async inicializarNomencladorSiVacio(): Promise<void> {
    const total = await this.nomencladorRepo.count();
    if (total === 0) {
      const prestacionesBase = [
        { codigo: 'CONS-GRAL', descripcion: 'Consulta Médica General', precioBase: 15000.0 },
        { codigo: 'CONS-GUARDIA', descripcion: 'Atención de Guardia Médica', precioBase: 18000.0 },
        { codigo: 'MED-IBUP-400', descripcion: 'Suministro Farmacia: Ibuprofeno 400mg', precioBase: 2500.0 },
        { codigo: 'MED-PARAC-500', descripcion: 'Suministro Farmacia: Paracetamol 500mg', precioBase: 2200.0 },
        { codigo: 'EST-HEMOGRAMA', descripcion: 'Laboratorio: Hemograma Completo', precioBase: 8500.0 },
        { codigo: 'DIA-INTERNACION', descripcion: 'Día de Cama en Sala Común', precioBase: 45000.0 },
      ];
      await this.nomencladorRepo.save(prestacionesBase);
    }
  }
}