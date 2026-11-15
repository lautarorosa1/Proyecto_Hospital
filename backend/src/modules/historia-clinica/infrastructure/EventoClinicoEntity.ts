import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import type { TipoEventoClinico } from '../domain/EventoClinico';

@Entity('historia_clinica_eventos')
@Index(['pacienteId', 'fecha'])
export class EventoClinicoEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'paciente_id', type: 'int' })
  pacienteId!: number;

  @Column({ type: 'varchar' })
  tipo!: TipoEventoClinico;

  @Column({ type: 'text' })
  resumen!: string;

  @Column({ name: 'referencia_id', type: 'int', nullable: true })
  referenciaId?: number | null;

  @Column({ type: 'boolean', default: false })
  alerta!: boolean;

  @Column({ type: 'timestamptz' })
  fecha!: Date;
}
