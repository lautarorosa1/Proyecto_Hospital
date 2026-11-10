import { Request, Response, NextFunction } from 'express';
import { AppError, ConflictError } from './errors';

// Nombres legibles para armar el mensaje de una violación de unique de PostgreSQL.
// Los textos de campo coinciden con los que el front busca para marcar el input.
const ENTIDADES: Record<string, string> = {
  pacientes: 'paciente',
  profesionales: 'profesional',
};
const CAMPOS: Record<string, string> = {
  dni: 'DNI',
  email: 'email',
  matricula: 'matrícula',
  usuario_id: 'usuario',
};

interface PgUniqueError {
  code?: string;
  table?: string;
  detail?: string; // "Key (dni)=(123) already exists."
}

function mensajeDeUnicidad(driverError: PgUniqueError): string {
  const entidad = driverError.table ? ENTIDADES[driverError.table] : undefined;
  const columna = /Key \(([^)]+)\)=/.exec(driverError.detail ?? '')?.[1];
  const campo = columna ? CAMPOS[columna] : undefined;
  if (!entidad || !campo) return 'Ya existe un registro con esos datos';
  return campo === 'usuario'
    ? `Ya existe un ${entidad} vinculado a ese usuario`
    : `Ya existe un ${entidad} con ese ${campo}`;
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message });
  }

  // JSON mal formado en el body (lo lanza express.json())
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'JSON inválido' });
  }

  // Violación de unique en PostgreSQL (dos requests simultáneos con mismo DNI/email/matrícula)
  const driverError = (err as { driverError?: PgUniqueError })?.driverError;
  if (driverError?.code === '23505') {
    const conflict = new ConflictError(mensajeDeUnicidad(driverError));
    return res.status(conflict.status).json({ error: conflict.message });
  }

  console.error(err);
  return res.status(500).json({ error: 'Error interno del servidor' });
}