import { IEstrategiaCobertura, ResultadoCalculo } from './IEstrategiaCobertura';

export class EstrategiaCoberturaParticular implements IEstrategiaCobertura {
  calcular(valorBase: number): ResultadoCalculo {
    return {
      tipoCobertura: 'PARTICULAR',
      valorBase,
      cargoPaciente: valorBase,
      cargoTercero: 0,
      enteAFacturar: 'Paciente (Sin cobertura)',
      descripcionDetalle: 'Particular: 100% a cargo del paciente.',
    };
  }
}