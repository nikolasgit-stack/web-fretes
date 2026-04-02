import { MigrationInterface, QueryRunner } from 'typeorm';

export class OperationalCrudFields1711000000000 implements MigrationInterface {
  name = 'OperationalCrudFields1711000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transportadoras" ADD "modalidade" character varying(80)`,
    );
    await queryRunner.query(
      `ALTER TABLE "transportadoras" ADD "contato" character varying(180)`,
    );
    await queryRunner.query(
      `ALTER TABLE "transportadoras" ADD "observacao" text`,
    );

    await queryRunner.query(
      `ALTER TABLE "centros_distribuicao" ADD "cep" character varying(8)`,
    );
    await queryRunner.query(
      `ALTER TABLE "centros_distribuicao" ADD "endereco" character varying(255)`,
    );

    await queryRunner.query(
      `ALTER TABLE "regras_frete" ADD "transportadoraId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "regras_frete" ADD "centroDistribuicaoId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "regras_frete" ADD "cepInicial" character varying(8)`,
    );
    await queryRunner.query(
      `ALTER TABLE "regras_frete" ADD "cepFinal" character varying(8)`,
    );
    await queryRunner.query(
      `ALTER TABLE "regras_frete" ADD "observacao" text`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_regras_frete_transportadora" ON "regras_frete" ("transportadoraId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_regras_frete_centro_distribuicao" ON "regras_frete" ("centroDistribuicaoId")`,
    );

    await queryRunner.query(`
      ALTER TABLE "regras_frete"
      ADD CONSTRAINT "FK_regras_frete_transportadora"
      FOREIGN KEY ("transportadoraId") REFERENCES "transportadoras"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "regras_frete"
      ADD CONSTRAINT "FK_regras_frete_centro_distribuicao"
      FOREIGN KEY ("centroDistribuicaoId") REFERENCES "centros_distribuicao"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "regras_frete" DROP CONSTRAINT "FK_regras_frete_centro_distribuicao"`,
    );
    await queryRunner.query(
      `ALTER TABLE "regras_frete" DROP CONSTRAINT "FK_regras_frete_transportadora"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_regras_frete_centro_distribuicao"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_regras_frete_transportadora"`,
    );

    await queryRunner.query(`ALTER TABLE "regras_frete" DROP COLUMN "observacao"`);
    await queryRunner.query(`ALTER TABLE "regras_frete" DROP COLUMN "cepFinal"`);
    await queryRunner.query(`ALTER TABLE "regras_frete" DROP COLUMN "cepInicial"`);
    await queryRunner.query(
      `ALTER TABLE "regras_frete" DROP COLUMN "centroDistribuicaoId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "regras_frete" DROP COLUMN "transportadoraId"`,
    );

    await queryRunner.query(`ALTER TABLE "centros_distribuicao" DROP COLUMN "endereco"`);
    await queryRunner.query(`ALTER TABLE "centros_distribuicao" DROP COLUMN "cep"`);

    await queryRunner.query(`ALTER TABLE "transportadoras" DROP COLUMN "observacao"`);
    await queryRunner.query(`ALTER TABLE "transportadoras" DROP COLUMN "contato"`);
    await queryRunner.query(`ALTER TABLE "transportadoras" DROP COLUMN "modalidade"`);
  }
}
