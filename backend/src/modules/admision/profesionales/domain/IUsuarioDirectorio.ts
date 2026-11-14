/**
 * Puerto hacia el módulo IAM: permite vincular un profesional con su usuario
 * de acceso sin que Admisión conozca la implementación de IAM.
 */
export interface UsuarioReferencia {
  id: string;
}

export interface IUsuarioDirectorio {
  findById(id: string): Promise<UsuarioReferencia | null>;
  findByEmail(email: string): Promise<UsuarioReferencia | null>;
}
