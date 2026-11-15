import { MigrationInterface, QueryRunner } from 'typeorm';

export class CrearAntecedentesFamiliares1794528000000
  implements MigrationInterface
{
  name = 'CrearAntecedentesFamiliares1794528000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "antecedentes_familiares" (
        "id" SERIAL NOT NULL,
        "parentesco" character varying(50) NOT NULL,
        "enfermedad" character varying(150) NOT NULL,
        "observaciones" character varying(500),
        "fechaRegistro" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "paciente_id" integer NOT NULL,
        CONSTRAINT "PK_antecedentes_familiares_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_antecedentes_familiares_paciente"
          FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id")
          ON DELETE RESTRICT ON UPDATE NO ACTION
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "antecedentes_familiares"`);
  }
}