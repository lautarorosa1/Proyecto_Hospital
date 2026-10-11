import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import type { EstadoProfesional, TipoProfesional } from '../domain/Profesional';

@Entity('profesionales')
export class ProfesionalEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // Por ahora son columnas simples. Cuando existan las entidades Usuario y
  // Especialidad se pueden transformar en relaciones (@ManyToOne) sin tocar
  // el dominio ni los servicios.
  @Column({ name: 'usuario_id', type: 'int', unique: true })
  usuarioId: number;

  @Column({ name: 'especialidad_id', type: 'int' })
  especialidadId: number;

  @Column({ type: 'varchar' })
  nombre: string;

  @Column({ type: 'varchar' })
  apellido: string;

  @Column({ type: 'varchar', length: 9, unique: true })
  dni: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  telefono?: string;

  @Column({ type: 'varchar', unique: true })
  matricula: string;

  @Column({ name: 'tipo_profesional', type: 'varchar' })
  tipoProfesional: TipoProfesional;

  @Column({ type: 'varchar', default: 'activo' })
  estado: EstadoProfesional;
}
