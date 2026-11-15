import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  VersionColumn,
  Index,
} from 'typeorm';
import type { EstadoTurno } from '../domain/Turno';

@Entity('turnos')
@Index(['profesionalId', 'fecha'])
export class TurnoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // Columnas simples (sin relación TypeORM), igual que en profesionales.
  @Column({ name: 'profesional_id', type: 'int' })
  profesionalId: number;

  @Column({ name: 'paciente_id', type: 'int', nullable: true })
  pacienteId?: number | null;

  @Column({ type: 'date' })
  fecha: string; // "YYYY-MM-DD"

  @Column({ name: 'hora_inicio', type: 'varchar', length: 5 })
  horaInicio: string; // "HH:mm"

  @Column({ name: 'duracion_min', type: 'int' })
  duracionMin: number;

  @Column({ type: 'varchar', default: 'disponible' })
  estado: EstadoTurno;

  // Control de concurrencia optimista (HU 1.1)
  @VersionColumn()
  version: number;

  // HU 1.2 - Entreturno
  @Column({ name: 'es_entreturno', type: 'boolean', default: false })
  esEntreturno: boolean;

  @Column({ name: 'duracion_original_min', type: 'int', nullable: true })
  duracionOriginalMin?: number | null;

  @Column({ name: 'reducido_por_entreturno_id', type: 'int', nullable: true })
  reducidoPorEntreturnoId?: number | null;
}
