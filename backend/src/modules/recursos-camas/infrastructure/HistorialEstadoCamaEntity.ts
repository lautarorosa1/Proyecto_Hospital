import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('historial_estados_cama')
export class HistorialEstadoCamaEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  cama_id: number;

  @Column({ type: 'varchar' })
  estado_anterior: string;

  @Column({ type: 'varchar' })
  estado_nuevo: string;

  @Column({ type: 'timestamptz' })
  fecha_cambio: Date;

  @Column({ type: 'int' })
  usuario_id: number;
}