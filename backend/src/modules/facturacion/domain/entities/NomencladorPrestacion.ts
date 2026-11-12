import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('nomenclador_prestaciones')
export class NomencladorPrestacion {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  codigo!: string; // Ej: 'CONS-001', 'MED-PARACETAMOL-500'

  @Column({ type: 'varchar', length: 150 })
  descripcion!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precioBase!: number;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  creadoEn!: Date;
}