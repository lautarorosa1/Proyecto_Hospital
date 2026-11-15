import type { NextFunction, Request, Response } from 'express';

const HEARTBEAT_MS = 25_000;

interface Cliente<F> {
  res: Response;
  filtro: F;
}

/**
 * Canal de Server-Sent Events reutilizable (monitores en tiempo real).
 * El front usa `EventSource`; no requiere dependencias extra.
 *
 * `leerFiltro` interpreta la query del cliente (por ej. ?profesionalId=7) y
 * `aceptar` decide si un mensaje le llega a ese cliente.
 */
export class SseChannel<F = undefined> {
  private readonly clientes = new Set<Cliente<F>>();

  constructor(
    private readonly leerFiltro: (req: Request) => F = () => undefined as F,
  ) {}

  difundir(
    evento: string,
    datos: unknown,
    aceptar: (filtro: F) => boolean = () => true,
  ): void {
    const mensaje = `event: ${evento}\ndata: ${JSON.stringify(datos)}\n\n`;
    for (const c of this.clientes) {
      if (aceptar(c.filtro)) c.res.write(mensaje);
    }
  }

  get cantidadClientes(): number {
    return this.clientes.size;
  }

  suscribir = (req: Request, res: Response, next: NextFunction) => {
    try {
      const filtro = this.leerFiltro(req);
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      });
      res.write('retry: 3000\n\n');

      const cliente: Cliente<F> = { res, filtro };
      this.clientes.add(cliente);

      // Comentario periódico para que proxies y balanceadores no corten la conexión.
      const heartbeat = setInterval(() => res.write(': ping\n\n'), HEARTBEAT_MS);
      req.on('close', () => {
        clearInterval(heartbeat);
        this.clientes.delete(cliente);
      });
    } catch (err) {
      next(err);
    }
  };
}
