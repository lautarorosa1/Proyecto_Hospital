import { IEstrategiaCobertura, ResultadoCalculo } from './IEstrategiaCobertura';

export class EstrategiaCoberturaPublica implements IEstrategiaCobertura {
  calcular(valorBase: number): ResultadoCalculo {
    return {
      tipoCobertura: 'PUBLICA',
      valorBase,
      cargoPaciente: 0,
      cargoTercero: valorBase,
      enteAFacturar: 'Estado / Ente Regulador',
      descripcionDetalle: 'Cobertura pública: 100% subsidiado por el Estado.',
    };
  }
}