import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('facturas')
export class Factura {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 30, unique: true })
  numeroComprobante!: string;

  @Column({ type: 'integer' })
  pacienteId!: number;

  @Column({ type: 'varchar', length: 20 })
  tipoLiquidacion!: string; // 'PACIENTE' | 'TERCERO'

  @Column({ type: 'varchar', length: 120 })
  destinatario!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  montoTotal!: number;

  @Column({ type: 'varchar', length: 20, default: 'EMITIDA' })
  estado!: string; // 'EMITIDA' | 'PAGADA' | 'ANULADA'

  @CreateDateColumn({ type: 'timestamp with time zone' })
  fechaEmision!: Date;
}