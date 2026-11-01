import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('asignaciones_cama')
export class AsignacionCamaEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  cama_id: number;

  @Column({ type: 'int' })
  paciente_id: number;

  @Column({ type: 'timestamptz' })
  fecha_asignacion: Date;

  @Column({ type: 'timestamptz', nullable: true })
  fecha_liberacion: Date | null;
}