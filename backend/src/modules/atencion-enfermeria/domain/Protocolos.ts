export interface Protocolo {
  id: number;
  nombre: string;
  descripcion: string;
  pasos: string[];
  /** Internación a la que se generó el protocolo (ingresos automáticos). */
  internacionId?: number;
}