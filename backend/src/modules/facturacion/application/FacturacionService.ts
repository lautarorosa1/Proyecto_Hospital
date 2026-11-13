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

  async obtenerPrestacionPorId(id: number): Promise<NomencladorPrestacion> {
    const prestacion = await this.nomencladorRepo.findOne({
      where: { id, activo: true },
    });
    if (!prestacion) {
      throw new Error(`No se encontró la prestación con ID #${id}.`);
    }
    return prestacion;
  }

  async crearPrestacion(codigo: string, descripcion: string, precioBase: number): Promise<NomencladorPrestacion> {
    const codigoLimpio = codigo.toUpperCase().trim();
    const existente = await this.nomencladorRepo.findOne({ where: { codigo: codigoLimpio } });

    if (existente) {
      if (existente.activo) {
        throw new Error(`Ya existe una prestación activa registrada con el código "${codigoLimpio}".`);
      }
      // Si había sido dada de baja antes, se reactiva con los nuevos valores
      existente.descripcion = descripcion.trim();
      existente.precioBase = precioBase;
      existente.activo = true;
      return await this.nomencladorRepo.save(existente);
    }

    const nueva = this.nomencladorRepo.create({
      codigo: codigoLimpio,
      descripcion: descripcion.trim(),
      precioBase,
      activo: true,
    });
    return await this.nomencladorRepo.save(nueva);
  }

  async actualizarPrestacion(
    id: number,
    codigo: string,
    descripcion: string,
    precioBase: number
  ): Promise<NomencladorPrestacion> {
    const prestacion = await this.obtenerPrestacionPorId(id);
    const codigoLimpio = codigo.toUpperCase().trim();

    if (codigoLimpio !== prestacion.codigo) {
      const duplicado = await this.nomencladorRepo.findOne({
        where: { codigo: codigoLimpio },
      });
      if (duplicado && duplicado.id !== id) {
        throw new Error(`Ya existe otra prestación con el código "${codigoLimpio}".`);
      }
    }

    prestacion.codigo = codigoLimpio;
    prestacion.descripcion = descripcion.trim();
    prestacion.precioBase = precioBase;

    return await this.nomencladorRepo.save(prestacion);
  }

  async eliminarPrestacion(id: number): Promise<void> {
    const prestacion = await this.obtenerPrestacionPorId(id);
    prestacion.activo = false;
    await this.nomencladorRepo.save(prestacion);
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

  async obtenerCargoPorId(id: number): Promise<CargoFacturacion> {
    const cargo = await this.cargoRepo.findOne({ where: { id } });
    if (!cargo) {
      throw new Error(`No se encontró el cargo #${id}.`);
    }
    return cargo;
  }

  async actualizarCargo(
    id: number,
    tipoCobertura: 'PUBLICA' | 'PREPAGA' | 'PARTICULAR',
    copagoFijo?: number,
    entidadNombre?: string
  ): Promise<CargoFacturacion> {
    const cargo = await this.obtenerCargoPorId(id);

    if (cargo.estado === 'FACTURADO') {
      throw new Error('No se puede modificar un cargo que ya ha sido facturado o liquidado.');
    }

    const prestacion = await this.nomencladorRepo.findOne({
      where: { descripcion: cargo.concepto, activo: true },
    });
    const valorBase = prestacion ? Number(prestacion.precioBase) : Number(cargo.valorBase);

    const calculo = this.calculador.calcular(
      tipoCobertura,
      valorBase,
      copagoFijo,
      entidadNombre
    );

    cargo.tipoCobertura = calculo.tipoCobertura;
    cargo.cargoPaciente = calculo.cargoPaciente;
    cargo.cargoTercero = calculo.cargoTercero;
    cargo.enteAFacturar = calculo.enteAFacturar;

    return await this.cargoRepo.save(cargo);
  }

  async eliminarCargo(id: number): Promise<void> {
    const cargo = await this.obtenerCargoPorId(id);

    if (cargo.estado === 'FACTURADO') {
      throw new Error('No se puede eliminar un cargo que ya forma parte de un comprobante emitido.');
    }

    await this.cargoRepo.remove(cargo);
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
    // El nomenclador inicia vacío para carga manual desde el Back-Office
  }
}