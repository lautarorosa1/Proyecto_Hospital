import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { PacienteEntity } from '../../admision/pacientes/infrastructure/PacienteEntity';

@Entity('internaciones')
export class InternacionEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => PacienteEntity, { nullable: false })
  @JoinColumn({ name: 'paciente_id' })
  paciente!: PacienteEntity;

  @Column({ name: 'fecha_ingreso', type: 'date' })
  fechaIngreso!: string;

  @Column({ name: 'fecha_egreso', type: 'date', nullable: true })
  fechaEgreso?: string;

  @Column({ name: 'motivo_ingreso', type: 'text' })
  motivoIngreso!: string;

  @Column({ type: 'varchar', default: 'ACTIVA' })
  estado!: 'ACTIVA' | 'FINALIZADA';

  @Column({ type: 'text', nullable: true })
  observaciones?: string;
}