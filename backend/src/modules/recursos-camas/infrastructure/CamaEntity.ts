import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('camas')
export class CamaEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  habitacion_id: number;

  @Column({ type: 'varchar', default: 'Libre' })
  estado: string;
}
