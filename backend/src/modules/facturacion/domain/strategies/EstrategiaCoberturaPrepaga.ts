import { IEstrategiaCobertura, ResultadoCalculo } from './IEstrategiaCobertura';

export class EstrategiaCoberturaPrepaga implements IEstrategiaCobertura {
  calcular(valorBase: number, copagoFijo: number = 0, entidadNombre: string = 'Medicina Prepaga'): ResultadoCalculo {
    const cargoPaciente = Math.min(copagoFijo, valorBase);
    const cargoTercero = Math.max(0, valorBase - cargoPaciente);

    return {
      tipoCobertura: 'PREPAGA',
      valorBase,
      cargoPaciente,
      cargoTercero,
      enteAFacturar: entidadNombre,
      descripcionDetalle: `Copago de $${cargoPaciente} para el paciente y saldo de $${cargoTercero} liquidado a ${entidadNombre}.`,
    };
  }
}