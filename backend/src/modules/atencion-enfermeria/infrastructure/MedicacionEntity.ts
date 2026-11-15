
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { InternacionEntity } from './InternacionEntity';
import { ProfesionalEntity } from '../../admision/profesionales/infrastructure/ProfesionalEntity';

@Entity('medicaciones')
export class MedicacionEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => InternacionEntity, { nullable: false })
  @JoinColumn({ name: 'internacion_id' })
  internacion!: InternacionEntity;

  @ManyToOne(() => ProfesionalEntity, { nullable: false })
  @JoinColumn({ name: 'profesional_id' })
  profesional!: ProfesionalEntity;

  @Column({ type: 'varchar' })
  nombre!: string;

  @Column({ type: 'varchar' })
  dosis!: string;

  @Column({ type: 'varchar' })
  frecuencia!: string;

  @Column({ name: 'via_administracion', type: 'varchar' })
  viaAdministracion!: string;

  @Column({ name: 'fecha_inicio', type: 'date' })
  fechaInicio!: string;

  @Column({ name: 'fecha_fin', type: 'date', nullable: true })
  fechaFin?: string;

  @Column({ type: 'varchar', default: 'ACTIVA' })
  estado!: 'ACTIVA' | 'SUSPENDIDA' | 'FINALIZADA';

  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  @Column({ name: 'insumo_id', type: 'int', nullable: true })
  insumoId?: number | null;

  @Column({ name: 'cantidad_insumo', type: 'int', default: 1 })
  cantidadInsumo!: number;
}