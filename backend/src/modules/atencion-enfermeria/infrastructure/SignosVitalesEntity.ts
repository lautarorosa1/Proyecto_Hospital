import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { InternacionEntity } from './InternacionEntity';
import { ProfesionalEntity } from '../../admision/profesionales/infrastructure/ProfesionalEntity';

@Entity('signos_vitales')
export class SignosVitalesEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => InternacionEntity, { nullable: false })
  @JoinColumn({ name: 'internacion_id' })
  internacion!: InternacionEntity;

  @ManyToOne(() => ProfesionalEntity, { nullable: false })
  @JoinColumn({ name: 'profesional_id' })
  profesional!: ProfesionalEntity;

  @Column({ name: 'fecha_hora', type: 'timestamp' })
  fechaHora!: Date;

  @Column({ type: 'float' })
  temperatura!: number;

  @Column({ name: 'frecuencia_cardiaca', type: 'int' })
  frecuenciaCardiaca!: number;

  @Column({ name: 'frecuencia_respiratoria', type: 'int' })
  frecuenciaRespiratoria!: number;

  @Column({ name: 'presion_sistolica', type: 'int' })
  presionSistolica!: number;

  @Column({ name: 'presion_diastolica', type: 'int' })
  presionDiastolica!: number;

  @Column({ name: 'saturacion_oxigeno', type: 'float' })
  saturacionOxigeno!: number;

  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  @Column({ type: 'boolean', default: false })
  alerta!: boolean;
}