import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameFreightTableModelTypesToWebFretes1713000000000
  implements MigrationInterface
{
  name = 'RenameFreightTableModelTypesToWebFretes1713000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."freight_table_model_type_enum" RENAME VALUE 'intelipost_padrao' TO 'web_fretes_padrao'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."freight_table_model_type_enum" RENAME VALUE 'intelipost_multi_origens' TO 'web_fretes_multi_origens'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."freight_table_model_type_enum" RENAME VALUE 'web_fretes_padrao' TO 'intelipost_padrao'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."freight_table_model_type_enum" RENAME VALUE 'web_fretes_multi_origens' TO 'intelipost_multi_origens'`,
    );
  }
}
