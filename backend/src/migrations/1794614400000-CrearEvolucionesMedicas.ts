import { MigrationInterface, QueryRunner } from 'typeorm';

export class CrearEvolucionesMedicas1794614400000
  implements MigrationInterface
{
  name = 'CrearEvolucionesMedicas1794614400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "evoluciones_medicas" (
        "id" SERIAL NOT NULL,
        "fecha" date NOT NULL,
        "motivoConsulta" character varying(200) NOT NULL,
        "observaciones" character varying(2000) NOT NULL,
        "indicaciones" character varying(2000),
        "fechaRegistro" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "paciente_id" integer NOT NULL,
        CONSTRAINT "PK_evoluciones_medicas_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_evoluciones_medicas_paciente"
          FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id")
          ON DELETE RESTRICT ON UPDATE NO ACTION
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "evoluciones_medicas"`);
  }
}