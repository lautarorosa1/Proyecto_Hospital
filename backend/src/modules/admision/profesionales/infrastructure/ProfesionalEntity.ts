import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import type { EstadoProfesional, TipoProfesional } from '../domain/Profesional';

@Entity('profesionales')
export class ProfesionalEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // Id (uuid) del usuario de IAM vinculado. Es opcional: un profesional puede
  // existir sin cuenta de acceso. Columna simple (sin FK) para no acoplar módulos.
  @Column({ name: 'usuario_id', type: 'varchar', nullable: true, unique: true })
  usuarioId: string | null;

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

  // Duración de cada turno de este profesional. Los turnos nuevos la toman de acá.
  @Column({ name: 'duracion_turno_min', type: 'int', default: 30 })
  duracionTurnoMin: number;

  @Column({ type: 'varchar', default: 'activo' })
  estado: EstadoProfesional;
}
