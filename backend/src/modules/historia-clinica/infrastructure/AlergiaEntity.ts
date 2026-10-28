
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from 'typeorm';

import { PacienteEntity } from '../../admision/pacientes/infrastructure/PacienteEntity';

@Entity('alergias')
export class AlergiaEntity {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 150 })
  alergeno!: string;

  @Column({ type: 'varchar', length: 255 })
  reaccion!: string;

  @Column({ type: 'varchar', length: 20 })
  severidad!: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaRegistro!: Date;

  @Column({ name: 'paciente_id', type: 'integer' })
  pacienteId!: number;

  @ManyToOne(() => PacienteEntity, {
    nullable: false,
    onDelete: 'RESTRICT'
  })
  @JoinColumn({ name: 'paciente_id' })
  paciente!: PacienteEntity;
}