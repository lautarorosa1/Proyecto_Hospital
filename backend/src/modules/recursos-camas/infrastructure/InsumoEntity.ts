import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('insumos')
export class InsumoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  nombre: string;

  @Column({ type: 'int' })
  stock_actual: number;

  @Column({ type: 'varchar' })
  unidad_medida: string;
}