import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('habitaciones')
export class HabitacionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  numero: string;

  @Column({ type: 'varchar' })
  piso: string;

  @Column({ type: 'varchar' })
  sector: string;
}