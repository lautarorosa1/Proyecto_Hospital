import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey
} from 'typeorm';

export class CreateAlergias1792886400000
  implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'alergias',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'alergeno',
            type: 'varchar',
            length: '150'
          },
          {
            name: 'reaccion',
            type: 'varchar',
            length: '255'
          },
          {
            name: 'severidad',
            type: 'varchar',
            length: '20'
          },
          {
            name: 'fechaRegistro',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP'
          },
          {
            name: 'paciente_id',
            type: 'integer'
          }
        ]
      }),
      true
    );

    await queryRunner.createForeignKey(
      'alergias',
      new TableForeignKey({
        columnNames: ['paciente_id'],
        referencedTableName: 'pacientes',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT'
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('alergias');
  }
}