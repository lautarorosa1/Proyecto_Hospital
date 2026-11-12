import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import type { EstadoEspera } from '../domain/ListaEspera';

@Entity('lista_espera_turnos')
@Index(['profesionalId', 'fecha', 'estado'])
export class EsperaTurnoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'profesional_id', type: 'int' })
  profesionalId: number;

  @Column({ name: 'paciente_id', type: 'int' })
  pacienteId: number;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'varchar', default: 'en_espera' })
  estado: EstadoEspera;

  @Column({ name: 'turno_id', type: 'int', nullable: true })
  turnoId?: number | null;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  creadoEn: Date;
}
