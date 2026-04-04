import { MigrationInterface, QueryRunner } from 'typeorm';

export class FreightTableImportsFoundation1712000000000
  implements MigrationInterface
{
  name = 'FreightTableImportsFoundation1712000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."freight_table_model_type_enum" AS ENUM('intelipost_padrao', 'intelipost_multi_origens')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."freight_table_upload_status_enum" AS ENUM('recebido', 'validado', 'erro_validacao', 'importado')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."freight_table_tariff_mode_enum" AS ENUM('peso', 'comparacao')`,
    );

    await queryRunner.query(`
      CREATE TABLE "freight_table_uploads" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "criado_em" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "atualizado_em" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "tenantId" uuid NOT NULL,
        "transportadoraId" uuid NOT NULL,
        "tipoTabela" "public"."freight_table_model_type_enum" NOT NULL,
        "nomeArquivoOriginal" character varying(255) NOT NULL,
        "storagePath" character varying(500) NOT NULL,
        "status" "public"."freight_table_upload_status_enum" NOT NULL DEFAULT 'recebido',
        "resumoValidacaoJson" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "importadoPor" character varying(180),
        CONSTRAINT "PK_freight_table_uploads_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_freight_table_uploads_tenant" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "FK_freight_table_uploads_transportadora" FOREIGN KEY ("transportadoraId") REFERENCES "transportadoras"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_freight_table_uploads_tenant_transportadora" ON "freight_table_uploads" ("tenantId", "transportadoraId", "criado_em")`,
    );

    await queryRunner.query(`
      CREATE TABLE "freight_tables" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "criado_em" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "atualizado_em" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "tenantId" uuid NOT NULL,
        "transportadoraId" uuid NOT NULL,
        "uploadId" uuid,
        "tipoTabela" "public"."freight_table_model_type_enum" NOT NULL,
        "nomeTabela" character varying(180) NOT NULL,
        "icmsCalculado" numeric(12,4) NOT NULL,
        "cubagem" numeric(12,4),
        "isencaoCubagem" boolean NOT NULL DEFAULT false,
        "limiteAltura" numeric(12,2),
        "limiteLargura" numeric(12,2),
        "limiteComprimento" numeric(12,2),
        "limiteSomaDimensoes" numeric(12,2),
        "ativo" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_freight_tables_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_freight_tables_tenant" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "FK_freight_tables_transportadora" FOREIGN KEY ("transportadoraId") REFERENCES "transportadoras"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "FK_freight_tables_upload" FOREIGN KEY ("uploadId") REFERENCES "freight_table_uploads"("id") ON DELETE SET NULL ON UPDATE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_freight_tables_lookup" ON "freight_tables" ("tenantId", "transportadoraId", "tipoTabela", "ativo")`,
    );

    await queryRunner.query(`
      CREATE TABLE "freight_table_origins" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "criado_em" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "atualizado_em" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "freightTableId" uuid NOT NULL,
        "cepOrigemInicial" character varying(8) NOT NULL,
        "cepOrigemFinal" character varying(8) NOT NULL,
        "metodoExternoId" character varying(120) NOT NULL,
        "centroDistribuicaoId" uuid,
        "nomeOrigem" character varying(180),
        CONSTRAINT "PK_freight_table_origins_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_freight_table_origins_table" FOREIGN KEY ("freightTableId") REFERENCES "freight_tables"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_freight_table_origins_cd" FOREIGN KEY ("centroDistribuicaoId") REFERENCES "centros_distribuicao"("id") ON DELETE SET NULL ON UPDATE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_freight_table_origins_table" ON "freight_table_origins" ("freightTableId")`,
    );

    await queryRunner.query(`
      CREATE TABLE "freight_table_ranges" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "criado_em" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "atualizado_em" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "freightTableId" uuid NOT NULL,
        "originId" uuid,
        "uf" character varying(2),
        "cidade" character varying(120),
        "cepInicial" character varying(8) NOT NULL,
        "cepFinal" character varying(8) NOT NULL,
        "prazo" integer NOT NULL,
        "valorMinimoFrete" numeric(14,2),
        "modoTarifa" "public"."freight_table_tariff_mode_enum" NOT NULL,
        CONSTRAINT "PK_freight_table_ranges_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_freight_table_ranges_table" FOREIGN KEY ("freightTableId") REFERENCES "freight_tables"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_freight_table_ranges_origin" FOREIGN KEY ("originId") REFERENCES "freight_table_origins"("id") ON DELETE SET NULL ON UPDATE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_freight_table_ranges_table" ON "freight_table_ranges" ("freightTableId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_freight_table_ranges_origin" ON "freight_table_ranges" ("originId")`,
    );

    await queryRunner.query(`
      CREATE TABLE "freight_table_weight_prices" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "criado_em" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "atualizado_em" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "rangeId" uuid NOT NULL,
        "pesoFaixa" numeric(12,4) NOT NULL,
        "valor" numeric(14,2) NOT NULL,
        "ordem" integer NOT NULL,
        CONSTRAINT "PK_freight_table_weight_prices_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_freight_table_weight_prices_range" FOREIGN KEY ("rangeId") REFERENCES "freight_table_ranges"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_freight_table_weight_prices_range" ON "freight_table_weight_prices" ("rangeId")`,
    );

    await queryRunner.query(`
      CREATE TABLE "freight_table_comparison_prices" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "criado_em" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "atualizado_em" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "rangeId" uuid NOT NULL,
        "valorPorKg" numeric(14,4),
        "percentualSobreNF" numeric(10,4),
        "freteMinimo" numeric(14,2),
        CONSTRAINT "PK_freight_table_comparison_prices_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_freight_table_comparison_prices_range" UNIQUE ("rangeId"),
        CONSTRAINT "FK_freight_table_comparison_prices_range" FOREIGN KEY ("rangeId") REFERENCES "freight_table_ranges"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "freight_table_fees" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "criado_em" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "atualizado_em" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "rangeId" uuid NOT NULL,
        "tipoTaxa" character varying(120) NOT NULL,
        "minimo" numeric(14,2),
        "maximo" numeric(14,2),
        "percentual" numeric(10,4),
        "valorFixo" numeric(14,2),
        "faixaPesoKg" numeric(12,4),
        "variacaoInicial" numeric(12,4),
        "variacaoFinal" numeric(12,4),
        "baseVariacao" character varying(80),
        "valorVariacao" numeric(14,4),
        "somaComPrimeiroValor" boolean,
        "modoCobrancaVariacao" character varying(80),
        CONSTRAINT "PK_freight_table_fees_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_freight_table_fees_range" FOREIGN KEY ("rangeId") REFERENCES "freight_table_ranges"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_freight_table_fees_range" ON "freight_table_fees" ("rangeId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_freight_table_fees_range"`);
    await queryRunner.query(`DROP TABLE "freight_table_fees"`);
    await queryRunner.query(`DROP TABLE "freight_table_comparison_prices"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_freight_table_weight_prices_range"`);
    await queryRunner.query(`DROP TABLE "freight_table_weight_prices"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_freight_table_ranges_origin"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_freight_table_ranges_table"`);
    await queryRunner.query(`DROP TABLE "freight_table_ranges"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_freight_table_origins_table"`);
    await queryRunner.query(`DROP TABLE "freight_table_origins"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_freight_tables_lookup"`);
    await queryRunner.query(`DROP TABLE "freight_tables"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_freight_table_uploads_tenant_transportadora"`);
    await queryRunner.query(`DROP TABLE "freight_table_uploads"`);
    await queryRunner.query(`DROP TYPE "public"."freight_table_tariff_mode_enum"`);
    await queryRunner.query(`DROP TYPE "public"."freight_table_upload_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."freight_table_model_type_enum"`);
  }
}
