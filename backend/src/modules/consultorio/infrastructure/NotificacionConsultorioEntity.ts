import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import type { TipoNotificacion } from '../domain/NotificacionConsultorio';

@Entity('notificaciones_consultorio')
@Index(['profesionalId', 'leida', 'creadaEn'])
export class NotificacionConsultorioEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'profesional_id', type: 'int' })
  profesionalId!: number;

  @Column({ type: 'varchar' })
  tipo!: TipoNotificacion;

  @Column({ type: 'varchar' })
  titulo!: string;

  @Column({ type: 'text' })
  mensaje!: string;

  @Column({ name: 'referencia_id', type: 'int', nullable: true })
  referenciaId?: number | null;

  @Column({ type: 'boolean', default: false })
  leida!: boolean;

  @CreateDateColumn({ name: 'creada_en', type: 'timestamptz' })
  creadaEn!: Date;
}
