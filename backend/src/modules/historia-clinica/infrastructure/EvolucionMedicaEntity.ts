import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from 'typeorm';

import { PacienteEntity } from '../../admision/pacientes/infrastructure/PacienteEntity';

@Entity('evoluciones_medicas')
export class EvolucionMedicaEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'date' })
  fecha!: string;

  @Column({ type: 'varchar', length: 200 })
  motivoConsulta!: string;

  @Column({ type: 'varchar', length: 2000 })
  observaciones!: string;

  @Column({ type: 'varchar', length: 2000, nullable: true })
  indicaciones!: string | null;

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