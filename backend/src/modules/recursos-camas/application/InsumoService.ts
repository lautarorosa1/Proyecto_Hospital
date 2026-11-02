import { IInsumoService } from './IInsumoService';
import { IInsumoRepository } from '../domain/IInsumoRepository';
import { IInventarioRepository, FalloStock } from '../domain/IInventarioRepository';
import { Insumo } from '../domain/Insumo';
import { MovimientoInventario } from '../domain/MovimientoInventario';
import { CreateInsumoDto } from './dtos/CreateInsumoDto';
import { UpdateInsumoDto } from './dtos/UpdateInsumoDto';
import { IngresarStockDto } from './dtos/IngresarStockDto';
import { ResponseInsumoDto } from './dtos/ResponseInsumoDto';
import { ResponseMovimientoInventarioDto } from './dtos/ResponseMovimientoInventarioDto';
import { ResponseMovimientoStockDto } from './dtos/ResponseMovimientoStockDto';
import { BadRequestError, ConflictError, NotFoundError } from '../../../shared/errors';

type InsumoData = Omit<Insumo, 'id'>;

export class InsumoService implements IInsumoService {
  constructor(
    private readonly insumoRepository: IInsumoRepository,
    private readonly inventarioRepository: IInventarioRepository,
  ) {}

  private toDto(insumo: Insumo): ResponseInsumoDto {
    return {
      id: insumo.id,
      nombre: insumo.nombre,
      stock_actual: insumo.stock_actual,
      unidad_medida: insumo.unidad_medida,
    };
  }

  private toMovimientoDto(movimiento: MovimientoInventario): ResponseMovimientoInventarioDto {
    return {
      id: movimiento.id,
      insumo_id: movimiento.insumo_id,
      tipo: movimiento.tipo,
      cantidad: movimiento.cantidad,
      referencia_id: movimiento.referencia_id,
      fecha_hora: movimiento.fecha_hora,
    };
  }

  private toStockDto(insumo: Insumo, movimiento: MovimientoInventario): ResponseMovimientoStockDto {
    return {
      insumo: this.toDto(insumo),
      movimiento: this.toMovimientoDto(movimiento),
    };
  }

  private exigirTexto(valor: unknown, campo: string): string {
    if (typeof valor !== 'string' || valor.trim() === '') {
      throw new BadRequestError(`El ${campo} es obligatorio`);
    }
    return valor.trim();
  }

  private exigirStock(valor: unknown): number {
    if (typeof valor !== 'number' || !Number.isInteger(valor) || valor < 0) {
      throw new BadRequestError('El stock_actual debe ser un entero mayor o igual a 0');
    }
    return valor;
  }

  private exigirEntero(valor: unknown, campo: string, minimo: number): number {
    if (typeof valor !== 'number' || !Number.isInteger(valor) || valor < minimo) {
      const limite = minimo === 0 ? 'mayor o igual a 0' : 'positivo';
      throw new BadRequestError(`El ${campo} debe ser un entero ${limite}`);
    }
    return valor;
  }

  private exigirCantidad(valor: unknown): number {
    if (typeof valor !== 'number' || !Number.isInteger(valor) || valor <= 0) {
      throw new BadRequestError('La cantidad debe ser un entero positivo');
    }
    return valor;
  }

  private fallarStock(fallo: FalloStock): never {
    if (fallo === 'no_encontrado') throw new NotFoundError('Insumo no encontrado');
    throw new ConflictError('El stock no alcanza para ese descuento');
  }

  async getAll(): Promise<ResponseInsumoDto[]> {
    const insumos = await this.insumoRepository.findAll();
    return insumos.map((insumo) => this.toDto(insumo));
  }

  async getById(id: number): Promise<ResponseInsumoDto> {
    const insumo = await this.insumoRepository.findById(id);
    if (!insumo) throw new NotFoundError('Insumo no encontrado');
    return this.toDto(insumo);
  }

  async consultarStock(): Promise<ResponseInsumoDto[]> {
    return this.getAll();
  }

  async consultarStockPorId(id: number): Promise<ResponseInsumoDto> {
    return this.getById(id);
  }

  async create(dto: CreateInsumoDto): Promise<ResponseInsumoDto> {
    const data: InsumoData = {
      nombre: this.exigirTexto(dto?.nombre, 'nombre'),
      stock_actual: this.exigirStock(dto?.stock_actual),
      unidad_medida: this.exigirTexto(dto?.unidad_medida, 'unidad_medida'),
    };
    const insumo = await this.insumoRepository.create(data);
    return this.toDto(insumo);
  }

  async update(id: number, dto: UpdateInsumoDto): Promise<ResponseInsumoDto> {
    const cuerpo = dto as UpdateInsumoDto & { stock_actual?: unknown };
    if (cuerpo?.stock_actual !== undefined) {
      throw new BadRequestError(
        'El stock_actual se modifica con un ingreso o un descuento',
      );
    }

    const existente = await this.insumoRepository.findById(id);
    if (!existente) throw new NotFoundError('Insumo no encontrado');

    const changes: Partial<InsumoData> = {};
    if (dto?.nombre !== undefined) changes.nombre = this.exigirTexto(dto.nombre, 'nombre');
    if (dto?.unidad_medida !== undefined) {
      changes.unidad_medida = this.exigirTexto(dto.unidad_medida, 'unidad_medida');
    }

    const actualizado = await this.insumoRepository.update(id, changes);
    if (!actualizado) throw new NotFoundError('Insumo no encontrado');
    return this.toDto(actualizado);
  }

  async remove(id: number): Promise<void> {
    const deleted = await this.insumoRepository.delete(id);
    if (!deleted) throw new NotFoundError('Insumo no encontrado');
  }

  async ingresar(id: number, dto: IngresarStockDto): Promise<ResponseMovimientoStockDto> {
    const cantidad = this.exigirCantidad(dto?.cantidad);
    const referenciaId = this.exigirEntero(dto?.referencia_id, 'referencia_id', 1);
    const resultado = await this.inventarioRepository.ingresar({
      insumoId: id,
      cantidad,
      referenciaId,
    });
    if (!resultado.ok) this.fallarStock(resultado.fallo);
    return this.toStockDto(resultado.insumo, resultado.movimiento);
  }

  async descontarPorMedicacion(payload: unknown): Promise<ResponseMovimientoStockDto> {
    if (payload === null || typeof payload !== 'object') {
      throw new BadRequestError('El evento de medicación administrada es inválido');
    }

    const dato = payload as {
      insumo_id?: unknown;
      cantidad?: unknown;
      referencia_id?: unknown;
    };
    const insumoId = this.exigirEntero(dato.insumo_id, 'insumo_id', 1);
    const cantidad = this.exigirCantidad(dato.cantidad);
    const referenciaId = this.exigirEntero(dato.referencia_id, 'referencia_id', 1);

    const resultado = await this.inventarioRepository.descontar({
      insumoId,
      cantidad,
      referenciaId,
    });
    if (!resultado.ok) this.fallarStock(resultado.fallo);
    return this.toStockDto(resultado.insumo, resultado.movimiento);
  }
}