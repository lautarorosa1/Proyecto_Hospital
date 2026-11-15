import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('movimientos_inventario')
export class MovimientoInventarioEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  insumo_id: number;

  @Column({ type: 'varchar' })
  tipo: string;

  @Column({ type: 'int' })
  cantidad: number;

  @Column({ type: 'int' })
  referencia_id: number;

  @Column({ type: 'timestamptz' })
  fecha_hora: Date;
}