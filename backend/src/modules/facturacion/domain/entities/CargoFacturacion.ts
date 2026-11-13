import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('cargos_facturacion')
export class CargoFacturacion {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'integer' })
  pacienteId!: number;

  @Column({ type: 'varchar', length: 150 })
  concepto!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valorBase!: number;

  @Column({ type: 'varchar', length: 20 })
  tipoCobertura!: string; // 'PUBLICA' | 'PREPAGA' | 'PARTICULAR'

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cargoPaciente!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cargoTercero!: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  enteAFacturar!: string;

  @Column({ type: 'varchar', length: 20, default: 'PENDIENTE' })
  estado!: string; // 'PENDIENTE' | 'FACTURADO' | 'ANULADO'

  @Column({ type: 'varchar', length: 100, nullable: true })
  eventoOrigenId!: string;

  @Column({ type: 'integer', nullable: true })
  facturaId?: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  fechaCarga!: Date;
}