import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from 'typeorm';

import { PacienteEntity } from '../../admision/pacientes/infrastructure/PacienteEntity';

@Entity('estudios_medicos')
export class EstudioMedicoEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'date' })
  fecha!: string;

  @Column({ type: 'varchar', length: 150 })
  tipoEstudio!: string;

  @Column({ type: 'varchar', length: 2000 })
  descripcion!: string;

  @Column({ type: 'varchar', length: 2000, nullable: true })
  resultado!: string | null;

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