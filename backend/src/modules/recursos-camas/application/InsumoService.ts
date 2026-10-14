import { IInsumoService } from './IInsumoService';
import { IInsumoRepository } from '../domain/IInsumoRepository';
import { Insumo } from '../domain/Insumo';
import { CreateInsumoDto } from './dtos/CreateInsumoDto';
import { UpdateInsumoDto } from './dtos/UpdateInsumoDto';
import { ResponseInsumoDto } from './dtos/ResponseInsumoDto';
import { BadRequestError, NotFoundError } from '../../../shared/errors';

type InsumoData = Omit<Insumo, 'id'>;

export class InsumoService implements IInsumoService {
  constructor(private readonly insumoRepository: IInsumoRepository) {}

  private toDto(insumo: Insumo): ResponseInsumoDto {
    return {
      id: insumo.id,
      nombre: insumo.nombre,
      stock_actual: insumo.stock_actual,
      unidad_medida: insumo.unidad_medida,
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
    const existente = await this.insumoRepository.findById(id);
    if (!existente) throw new NotFoundError('Insumo no encontrado');

    const changes: Partial<InsumoData> = {};
    if (dto?.nombre !== undefined) changes.nombre = this.exigirTexto(dto.nombre, 'nombre');
    if (dto?.stock_actual !== undefined) changes.stock_actual = this.exigirStock(dto.stock_actual);
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
}