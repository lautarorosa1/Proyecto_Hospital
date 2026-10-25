import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('horarios_profesional')
@Index(['profesionalId', 'diaSemana'])
export class HorarioProfesionalEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'profesional_id', type: 'int' })
  profesionalId: number;

  @Column({ name: 'dia_semana', type: 'int' })
  diaSemana: number; // 1 = lunes ... 7 = domingo

  @Column({ name: 'hora_desde', type: 'varchar', length: 5 })
  horaDesde: string; // "HH:mm"

  @Column({ name: 'hora_hasta', type: 'varchar', length: 5 })
  horaHasta: string; // "HH:mm"
}
