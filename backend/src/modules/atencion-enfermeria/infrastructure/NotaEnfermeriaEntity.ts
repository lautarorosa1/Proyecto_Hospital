
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { PacienteEntity } from '../../admision/pacientes/infrastructure/PacienteEntity';
import { ProfesionalEntity } from '../../admision/profesionales/infrastructure/ProfesionalEntity';

@Entity('notas_enfermeria')
export class NotaEnfermeriaEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha!: Date;

  @Column({ type: 'text' })
  contenido!: string;

  @ManyToOne(() => PacienteEntity)
  @JoinColumn({ name: 'paciente_id' })
  paciente!: PacienteEntity;

  @ManyToOne(() => ProfesionalEntity)
  @JoinColumn({ name: 'profesional_id' })
  profesional!: ProfesionalEntity;
}