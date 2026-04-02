import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1710000000000 implements MigrationInterface {
  name = 'InitialSchema1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await queryRunner.query(
      `CREATE TYPE "public"."transportadoras_tipointegracao_enum" AS ENUM('manual', 'api', 'hub')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tabelas_frete_tipotabela_enum" AS ENUM('padrao', 'promocional', 'negociada')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."cotacoes_status_enum" AS ENUM('processando', 'concluida', 'sem_opcoes')`,
    );

    await queryRunner.query(`
      CREATE TABLE "tenants" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "criado_em" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "atualizado_em" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "nome" character varying(180) NOT NULL,
        "slug" character varying(120) NOT NULL,
        "ativo" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_tenants_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_tenants_slug" UNIQUE ("slug")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "criado_em" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "atualizado_em" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "tenantId" uuid NOT NULL,
        "nome" character varying(180) NOT NULL,
        "email" character varying(180) NOT NULL,
        "senha" character varying(255) NOT NULL,
        "ativo" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_tenant_email" UNIQUE ("tenantId", "email"),
        CONSTRAINT "FK_users_tenant" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_users_tenantId" ON "users" ("tenantId")`);

    await queryRunner.query(`
      CREATE TABLE "transportadoras" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "criado_em" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "atualizado_em" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "tenantId" uuid NOT NULL,
        "nome" character varying(180) NOT NULL,
        "codigoInterno" character varying(80) NOT NULL,
        "tipoIntegracao" "public"."transportadoras_tipointegracao_enum" NOT NULL DEFAULT 'manual',
        "ativo" boolean NOT NULL DEFAULT true,
        "prazoCd" integer NOT NULL DEFAULT 0,
        "cubagem" numeric(12,4) NOT NULL DEFAULT 0,
        "isencaoCubagem" boolean NOT NULL DEFAULT false,
        "icmsIncluso" boolean NOT NULL DEFAULT false,
        "estadoOrigem" character varying(2) NOT NULL,
        "linhaBranca" boolean NOT NULL DEFAULT false,
        "limiteAltura" numeric(12,2),
        "limiteLargura" numeric(12,2),
        "limiteComprimento" numeric(12,2),
        CONSTRAINT "PK_transportadoras_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_transportadoras_tenant_codigo" UNIQUE ("tenantId", "codigoInterno"),
        CONSTRAINT "FK_transportadoras_tenant" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_transportadoras_tenantId" ON "transportadoras" ("tenantId")`);

    await queryRunner.query(`
      CREATE TABLE "produtos" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "criado_em" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "atualizado_em" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "tenantId" uuid NOT NULL,
        "sku" character varying(80) NOT NULL,
        "nome" character varying(180) NOT NULL,
        "peso" numeric(12,4) NOT NULL,
        "altura" numeric(12,2) NOT NULL,
        "largura" numeric(12,2) NOT NULL,
        "comprimento" numeric(12,2) NOT NULL,
        "valor" numeric(14,2) NOT NULL,
        "ativo" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_produtos_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_produtos_tenant_sku" UNIQUE ("tenantId", "sku"),
        CONSTRAINT "FK_produtos_tenant" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_produtos_tenantId" ON "produtos" ("tenantId")`);

    await queryRunner.query(`
      CREATE TABLE "centros_distribuicao" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "criado_em" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "atualizado_em" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "tenantId" uuid NOT NULL,
        "nome" character varying(180) NOT NULL,
        "codigoInterno" character varying(80) NOT NULL,
        "cidade" character varying(120) NOT NULL,
        "estado" character varying(2) NOT NULL,
        "ativo" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_centros_distribuicao_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_centros_distribuicao_tenant_codigo" UNIQUE ("tenantId", "codigoInterno"),
        CONSTRAINT "FK_centros_distribuicao_tenant" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_centros_distribuicao_tenantId" ON "centros_distribuicao" ("tenantId")`);

    await queryRunner.query(`
      CREATE TABLE "tabelas_frete" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "criado_em" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "atualizado_em" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "tenantId" uuid NOT NULL,
        "transportadoraId" uuid NOT NULL,
        "centroDistribuicaoId" uuid NOT NULL,
        "vigenciaInicio" date NOT NULL,
        "vigenciaFim" date,
        "ativa" boolean NOT NULL DEFAULT true,
        "tipoTabela" "public"."tabelas_frete_tipotabela_enum" NOT NULL DEFAULT 'padrao',
        CONSTRAINT "PK_tabelas_frete_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_tabelas_frete_tenant" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "FK_tabelas_frete_transportadora" FOREIGN KEY ("transportadoraId") REFERENCES "transportadoras"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "FK_tabelas_frete_cd" FOREIGN KEY ("centroDistribuicaoId") REFERENCES "centros_distribuicao"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_tabelas_frete_tenantId" ON "tabelas_frete" ("tenantId")`);
    await queryRunner.query(`CREATE INDEX "IDX_tabelas_frete_combo" ON "tabelas_frete" ("tenantId", "transportadoraId", "centroDistribuicaoId", "tipoTabela")`);

    await queryRunner.query(`
      CREATE TABLE "regras_frete" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "criado_em" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "atualizado_em" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "tenantId" uuid NOT NULL,
        "nome" character varying(180) NOT NULL,
        "marketplace" character varying(120),
        "ufDestino" character varying(2),
        "pesoMin" numeric(12,4),
        "pesoMax" numeric(12,4),
        "ativo" boolean NOT NULL DEFAULT true,
        "prioridade" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_regras_frete_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_regras_frete_tenant" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_regras_frete_tenantId" ON "regras_frete" ("tenantId")`);
    await queryRunner.query(`CREATE INDEX "IDX_regras_frete_prioridade" ON "regras_frete" ("tenantId", "prioridade")`);

    await queryRunner.query(`
      CREATE TABLE "cotacoes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "criado_em" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "atualizado_em" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "tenantId" uuid NOT NULL,
        "cepDestino" character varying(8) NOT NULL,
        "valorProdutos" numeric(14,2) NOT NULL,
        "pesoTotal" numeric(12,4) NOT NULL,
        "volumeTotal" integer NOT NULL,
        "marketplace" character varying(120),
        "status" "public"."cotacoes_status_enum" NOT NULL DEFAULT 'processando',
        "melhorOpcaoId" uuid,
        CONSTRAINT "PK_cotacoes_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_cotacoes_tenant" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_cotacoes_tenant_criado" ON "cotacoes" ("tenantId", "criado_em")`);

    await queryRunner.query(`
      CREATE TABLE "cotacoes_opcoes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "criado_em" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "atualizado_em" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "cotacaoId" uuid NOT NULL,
        "transportadoraId" uuid NOT NULL,
        "metodoEnvio" character varying(80) NOT NULL,
        "prazo" integer NOT NULL,
        "tarifa" numeric(14,2) NOT NULL,
        "tarifaExibida" numeric(14,2) NOT NULL,
        "ativa" boolean NOT NULL DEFAULT true,
        "semCobertura" boolean NOT NULL DEFAULT false,
        "retiradaCotacao" boolean NOT NULL DEFAULT false,
        "regra" character varying(180),
        "detalheJson" jsonb NOT NULL DEFAULT '{}'::jsonb,
        CONSTRAINT "PK_cotacoes_opcoes_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_cotacoes_opcoes_cotacao" FOREIGN KEY ("cotacaoId") REFERENCES "cotacoes"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_cotacoes_opcoes_transportadora" FOREIGN KEY ("transportadoraId") REFERENCES "transportadoras"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_cotacoes_opcoes_cotacao" ON "cotacoes_opcoes" ("cotacaoId")`);

    await queryRunner.query(`
      ALTER TABLE "cotacoes"
      ADD CONSTRAINT "FK_cotacoes_melhor_opcao"
      FOREIGN KEY ("melhorOpcaoId") REFERENCES "cotacoes_opcoes"("id")
      ON DELETE SET NULL ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "cotacoes" DROP CONSTRAINT "FK_cotacoes_melhor_opcao"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_cotacoes_opcoes_cotacao"`);
    await queryRunner.query(`DROP TABLE "cotacoes_opcoes"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_cotacoes_tenant_criado"`);
    await queryRunner.query(`DROP TABLE "cotacoes"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_regras_frete_prioridade"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_regras_frete_tenantId"`);
    await queryRunner.query(`DROP TABLE "regras_frete"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_tabelas_frete_combo"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_tabelas_frete_tenantId"`);
    await queryRunner.query(`DROP TABLE "tabelas_frete"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_centros_distribuicao_tenantId"`);
    await queryRunner.query(`DROP TABLE "centros_distribuicao"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_produtos_tenantId"`);
    await queryRunner.query(`DROP TABLE "produtos"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_transportadoras_tenantId"`);
    await queryRunner.query(`DROP TABLE "transportadoras"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_users_tenantId"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "tenants"`);
    await queryRunner.query(`DROP TYPE "public"."cotacoes_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."tabelas_frete_tipotabela_enum"`);
    await queryRunner.query(`DROP TYPE "public"."transportadoras_tipointegracao_enum"`);
  }
}
