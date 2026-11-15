import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('permisos')
export class PermisoEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  nombre!: string;

  @Column({ type: 'varchar', length: 255 })
  descripcion!: string;
}

