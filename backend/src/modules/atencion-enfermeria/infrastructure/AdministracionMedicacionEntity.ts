import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  Index,
} from 'typeorm';

// El índice único (medicación, horario programado) garantiza a nivel de base
// de datos que una misma dosis no se administre ni descuente dos veces, aun con
// dos enfermeros confirmando a la vez.
@Entity('administraciones_medicacion')
@Unique('uq_administracion_dosis', ['medicacionId', 'programadaPara'])
@Index(['internacionId'])
export class AdministracionMedicacionEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'medicacion_id', type: 'int' })
  medicacionId!: number;

  @Column({ name: 'internacion_id', type: 'int' })
  internacionId!: number;

  @Column({ name: 'enfermero_id', type: 'int' })
  enfermeroId!: number;

  @Column({ name: 'programada_para', type: 'timestamptz' })
  programadaPara!: Date;

  @Column({ name: 'administrada_en', type: 'timestamptz' })
  administradaEn!: Date;

  @Column({ name: 'cantidad_descontada', type: 'int', default: 0 })
  cantidadDescontada!: number;
}
