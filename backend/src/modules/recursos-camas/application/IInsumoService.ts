import { ResponseInsumoDto } from './dtos/ResponseInsumoDto';
import { CreateInsumoDto } from './dtos/CreateInsumoDto';
import { UpdateInsumoDto } from './dtos/UpdateInsumoDto';
import { IngresarStockDto } from './dtos/IngresarStockDto';
import { ResponseMovimientoStockDto } from './dtos/ResponseMovimientoStockDto';

export interface IInsumoService {
  getAll(): Promise<ResponseInsumoDto[]>;
  getById(id: number): Promise<ResponseInsumoDto>;
  consultarStock(): Promise<ResponseInsumoDto[]>;
  consultarStockPorId(id: number): Promise<ResponseInsumoDto>;
  create(dto: CreateInsumoDto): Promise<ResponseInsumoDto>;
  update(id: number, dto: UpdateInsumoDto): Promise<ResponseInsumoDto>;
  remove(id: number): Promise<void>;
  ingresar(id: number, dto: IngresarStockDto): Promise<ResponseMovimientoStockDto>;
  descontarPorMedicacion(payload: unknown): Promise<ResponseMovimientoStockDto>;
}