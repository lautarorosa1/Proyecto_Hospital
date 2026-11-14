import { MigrationInterface, QueryRunner } from 'typeorm';

export class CrearEstudiosMedicos1794700800000 implements MigrationInterface {
  name = 'CrearEstudiosMedicos1794700800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "estudios_medicos" (
        "id" SERIAL NOT NULL,
        "fecha" date NOT NULL,
        "tipoEstudio" character varying(150) NOT NULL,
        "descripcion" character varying(2000) NOT NULL,
        "resultado" character varying(2000),
        "fechaRegistro" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "paciente_id" integer NOT NULL,
        CONSTRAINT "PK_estudios_medicos_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_estudios_medicos_paciente"
          FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id")
          ON DELETE RESTRICT ON UPDATE NO ACTION
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "estudios_medicos"`);
  }
}