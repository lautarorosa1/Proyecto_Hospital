
import { AppDataSource } from '../../../data-source';
import { NotaEnfermeriaEntity } from './NotaEnfermeriaEntity';
import type { INotaEnfermeriaRepository } from '../domain/NotaEnfermeriaRepository';
import type { NotaEnfermeria } from '../domain/NotaEnfermeria';

export class NotaEnfermeriaRepositoryPostgres
  implements INotaEnfermeriaRepository {

  private get repository() {
    return AppDataSource.getRepository(NotaEnfermeriaEntity);
  }

  async create(
    datos: Omit<NotaEnfermeria, 'id'>
  ): Promise<NotaEnfermeria> {

    const nota = this.repository.create({
      fecha: datos.fecha,
      contenido: datos.contenido,
      paciente: { id: datos.pacienteId },
      profesional: { id: datos.profesionalId },
    });

    const guardado = await this.repository.save(nota);

    return {
      id: guardado.id,
      fecha: guardado.fecha,
      contenido: guardado.contenido,
      pacienteId: datos.pacienteId,
      profesionalId: datos.profesionalId,
    };
  }

  async findById(id: number): Promise<NotaEnfermeria | null> {
    const nota = await this.repository.findOne({
      where: { id },
      relations: {
        paciente: true,
        profesional: true,
      },
    });

    if (!nota) return null;

    return this.toDomain(nota);
  }

  async findAll(): Promise<NotaEnfermeria[]> {
    const notas = await this.repository.find({
      relations: {
        paciente: true,
        profesional: true,
      },
    });

    return notas.map((nota) => this.toDomain(nota));
  }

  async update(
    id: number,
    datos: Partial<Omit<NotaEnfermeria, 'id'>>
  ): Promise<NotaEnfermeria | null> {

    const nota = await this.repository.findOne({
      where: { id },
      relations: {
        paciente: true,
        profesional: true,
      },
    });

    if (!nota) return null;

    if (datos.fecha !== undefined) {
      nota.fecha = datos.fecha;
    }

    if (datos.contenido !== undefined) {
      nota.contenido = datos.contenido;
    }

    if (datos.pacienteId !== undefined) {
      nota.paciente = { id: datos.pacienteId } as NotaEnfermeriaEntity['paciente'];
    }

    if (datos.profesionalId !== undefined) {
      nota.profesional = { id: datos.profesionalId } as NotaEnfermeriaEntity['profesional'];
    }

    const actualizada = await this.repository.save(nota);

    // Volvemos a consultar para recuperar correctamente las relaciones.
    const notaCompleta = await this.repository.findOne({
      where: { id: actualizada.id },
      relations: {
        paciente: true,
        profesional: true,
      },
    });

    if (!notaCompleta) return null;

    return this.toDomain(notaCompleta);
  }

  async delete(id: number): Promise<boolean> {
    const resultado = await this.repository.delete(id);

    return (resultado.affected ?? 0) > 0;
  }

  private toDomain(nota: NotaEnfermeriaEntity): NotaEnfermeria {
    return {
      id: nota.id,
      fecha: nota.fecha,
      contenido: nota.contenido,
      pacienteId: nota.paciente.id,
      profesionalId: nota.profesional.id,
    };
  }
}