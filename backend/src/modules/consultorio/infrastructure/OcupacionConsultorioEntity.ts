import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import type { EstadoOcupacion } from '../domain/OcupacionConsultorio';

// Índices únicos PARCIALES: solo cuentan las ocupaciones activas. Garantizan en la
// base de datos (no solo en el código) que un consultorio no tenga dos profesionales
// a la vez y que un profesional no ocupe dos consultorios.
@Entity('ocupaciones_consultorio')
@Index('uq_ocupacion_activa_habitacion', ['habitacionId'], {
  unique: true,
  where: `"estado" = 'activa'`,
})
@Index('uq_ocupacion_activa_profesional', ['profesionalId'], {
  unique: true,
  where: `"estado" = 'activa'`,
})
export class OcupacionConsultorioEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'habitacion_id', type: 'int' })
  habitacionId!: number;

  @Column({ name: 'profesional_id', type: 'int' })
  profesionalId!: number;

  @Column({ type: 'varchar', default: 'activa' })
  estado!: EstadoOcupacion;

  @Column({ name: 'iniciada_en', type: 'timestamptz' })
  iniciadaEn!: Date;

  @Column({ name: 'finalizada_en', type: 'timestamptz', nullable: true })
  finalizadaEn?: Date | null;
}
