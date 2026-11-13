import { IEstrategiaCobertura, ResultadoCalculo } from '../domain/strategies/IEstrategiaCobertura';
import { EstrategiaCoberturaPublica } from '../domain/strategies/EstrategiaCoberturaPublica';
import { EstrategiaCoberturaPrepaga } from '../domain/strategies/EstrategiaCoberturaPrepaga';
import { EstrategiaCoberturaParticular } from '../domain/strategies/EstrategiaCoberturaParticular';

export class CalculadorFacturacionService {
  private estrategias: Map<string, IEstrategiaCobertura> = new Map();

  constructor() {
    this.estrategias.set('PUBLICA', new EstrategiaCoberturaPublica());
    this.estrategias.set('PREPAGA', new EstrategiaCoberturaPrepaga());
    this.estrategias.set('PARTICULAR', new EstrategiaCoberturaParticular());
  }

  /**
   * Resuelve dinámicamente la estrategia de cobertura correspondiente.
   * Si no se define o no existe, aplica PARTICULAR por defecto.
   */
  calcular(
    tipoCobertura: string,
    valorBase: number,
    copagoFijo?: number,
    entidadNombre?: string
  ): ResultadoCalculo {
    const clave = (tipoCobertura || 'PARTICULAR').toUpperCase().trim();
    const estrategia = this.estrategias.get(clave) || this.estrategias.get('PARTICULAR')!;

    return estrategia.calcular(valorBase, copagoFijo, entidadNombre);
  }
}