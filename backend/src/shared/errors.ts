export class AppError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = new.target.name;
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) { super(message, 400); }
}

export class NotFoundError extends AppError {
  constructor(message: string) { super(message, 404); }
}

export class ConflictError extends AppError {
  constructor(message: string) { super(message, 409); }
}

// Transición de estado no permitida por las reglas de negocio del turno.
// Hereda de ConflictError: sigue respondiendo 409, igual que antes.
export class TransicionInvalidaError extends ConflictError {}

/** Status HTTP de un error: el de un AppError, o `porDefecto` para cualquier otro. */
export function statusDe(error: unknown, porDefecto = 400): number {
  return error instanceof AppError ? error.status : porDefecto;
}
