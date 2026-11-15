export interface NotaEnfermeria {
  id: number;
  fecha: Date;
  contenido: string;
  pacienteId: number;
  profesionalId: number;
}