import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('camas')
export class CamaEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  numero: string;

  @Column({ type: 'int' })
  habitacion_id: number;

  @Column({ type: 'varchar', default: 'Libre' })
  estado: string;

  @Column({ type: 'int', default: 0 })
  version: number;
}