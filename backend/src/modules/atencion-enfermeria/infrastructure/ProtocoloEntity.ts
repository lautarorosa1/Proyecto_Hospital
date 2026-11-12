
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity('protocolos')
export class ProtocoloEntity {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 150 })
  nombre!: string;

  @Column({ type: 'text' })
  descripcion!: string;

  @Column({ type: 'jsonb' })
  pasos!: string[];

  @Column({ name: 'internacion_id', type: 'int', nullable: true })
  internacionId?: number | null;
}