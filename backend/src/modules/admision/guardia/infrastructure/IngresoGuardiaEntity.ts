import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import type { NivelTriaje } from '../domain/NivelTriaje';
import type { EstadoIngreso } from '../domain/IngresoGuardia';

@Entity('ingresos_guardia')
// Orden de la cola de espera: estado -> prioridad -> llegada.
@Index(['estado', 'prioridad', 'ingresadoEn'])
// Un paciente no puede estar dos veces activo en la guardia, ni siquiera con
// dos requests simultáneos (lo garantiza la base, no solo el service).
@Index('uq_ingreso_guardia_activo_por_paciente', ['pacienteId'], {
  unique: true,
  where: `"estado" IN ('en_espera', 'en_atencion')`,
})
export class IngresoGuardiaEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'paciente_id', type: 'int' })
  pacienteId: number;

  @Column({ name: 'enfermero_id', type: 'int' })
  enfermeroId: number;

  @Column({ name: 'nivel_triaje', type: 'varchar', length: 20 })
  nivelTriaje: NivelTriaje;

  @Column({ type: 'int' })
  prioridad: number;

  @Column({ name: 'motivo_consulta', type: 'varchar', length: 500 })
  motivoConsulta: string;

  @Column({ type: 'text', nullable: true })
  observaciones?: string | null;

  @Column({ type: 'varchar', length: 20, default: 'en_espera' })
  estado: EstadoIngreso;

  @CreateDateColumn({ name: 'ingresado_en', type: 'timestamptz' })
  ingresadoEn: Date;
}
