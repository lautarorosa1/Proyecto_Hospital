import { Request, Response, NextFunction } from 'express';
import { AppError, ConflictError } from './errors';

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

  // Violación de unique en PostgreSQL (dos requests simultáneos con mismo DNI/email)
  const code = (err as { driverError?: { code?: string } })?.driverError?.code;
  if (code === '23505') {
    const conflict = new ConflictError('Ya existe un paciente con ese DNI o email');
    return res.status(conflict.status).json({ error: conflict.message });
  }

  console.error(err);
  return res.status(500).json({ error: 'Error interno del servidor' });
}