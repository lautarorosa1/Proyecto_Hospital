import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { InternacionEntity } from './InternacionEntity';
import { ProfesionalEntity } from '../../admision/profesionales/infrastructure/ProfesionalEntity';

@Entity('indicaciones')
export class IndicacionEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => InternacionEntity, { nullable: false })
  @JoinColumn({ name: 'internacion_id' })
  internacion!: InternacionEntity;

  @ManyToOne(() => ProfesionalEntity, { nullable: false })
  @JoinColumn({ name: 'profesional_id' })
  profesional!: ProfesionalEntity;

  @Column({ type: 'text' })
  descripcion!: string;

  @Column({ type: 'timestamp' })
  fecha!: Date;

  @Column({ type: 'varchar', default: 'ACTIVA' })
  estado!: 'ACTIVA' | 'CUMPLIDA' | 'SUSPENDIDA';

  @Column({ type: 'text', nullable: true })
  observaciones?: string;
}