export interface ResultadoCalculo {
  tipoCobertura: string;
  valorBase: number;
  cargoPaciente: number;
  cargoTercero: number;      // Obra social, prepaga o subsidio estatal
  enteAFacturar: string;     // 'Paciente', 'Estado / Ente Regulador', o nombre de Prepaga
  descripcionDetalle: string;
}

export interface IEstrategiaCobertura {
  calcular(valorBase: number, copagoFijo?: number, entidadNombre?: string): ResultadoCalculo;
}