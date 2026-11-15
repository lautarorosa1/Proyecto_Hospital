import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from 'typeorm';

import { PacienteEntity } from '../../admision/pacientes/infrastructure/PacienteEntity';

@Entity('antecedentes_familiares')
export class AntecedenteFamiliarEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 50 })
  parentesco!: string;

  @Column({ type: 'varchar', length: 150 })
  enfermedad!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  observaciones!: string | null;

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