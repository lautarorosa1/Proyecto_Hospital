import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('pacientes')
export class PacienteEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  nombre: string;

  @Column({ type: 'varchar' })
  apellido: string;

  @Column({ type: 'varchar', length: 9, unique: true })
  dni: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ name: 'fecha_nacimiento', type: 'date' })
  fechaNacimiento: string; // "YYYY-MM-DD"

  @Column({ type: 'varchar', nullable: true })
  telefono?: string;

  @Column({ type: 'varchar', nullable: true })
  direccion?: string;
}