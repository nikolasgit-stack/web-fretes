import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import { DataSource } from 'typeorm';
import { CentroDistribuicao } from '../centros-distribuicao/entities/centro-distribuicao.entity';
import { CotacaoOpcao } from '../cotacoes-opcoes/entities/cotacao-opcao.entity';
import { Cotacao } from '../cotacoes/entities/cotacao.entity';
import { Produto } from '../produtos/entities/produto.entity';
import { RegraFrete } from '../regras-frete/entities/regra-frete.entity';
import { FreightTableComparisonPrice } from '../tabelas-frete/entities/freight-table-comparison-price.entity';
import { FreightTableFee } from '../tabelas-frete/entities/freight-table-fee.entity';
import { FreightTableOrigin } from '../tabelas-frete/entities/freight-table-origin.entity';
import { FreightTableRange } from '../tabelas-frete/entities/freight-table-range.entity';
import { FreightTableUpload } from '../tabelas-frete/entities/freight-table-upload.entity';
import { FreightTableWeightPrice } from '../tabelas-frete/entities/freight-table-weight-price.entity';
import { FreightTable } from '../tabelas-frete/entities/freight-table.entity';
import { TabelaFrete } from '../tabelas-frete/entities/tabela-frete.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Transportadora } from '../transportadoras/entities/transportadora.entity';
import { User } from '../users/entities/user.entity';
import { InitialSchema1710000000000 } from './migrations/1710000000000-InitialSchema';
import { FreightTableImportsFoundation1712000000000 } from './migrations/1712000000000-FreightTableImportsFoundation';
import { RenameFreightTableModelTypesToWebFretes1713000000000 } from './migrations/1713000000000-RenameFreightTableModelTypesToWebFretes';
import { OperationalCrudFields1711000000000 } from './migrations/1711000000000-OperationalCrudFields';

loadEnv({ path: '.env.production' });

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number(process.env.DATABASE_PORT ?? 5432),
  username: process.env.DATABASE_USER ?? 'postgres',
  password: process.env.DATABASE_PASSWORD ?? 'postgres',
  database: process.env.DATABASE_NAME ?? 'shopping_fretes',
  ssl:
    process.env.DATABASE_SSL === 'true'
      ? {
          rejectUnauthorized: false,
        }
      : false,
  synchronize: false,
  entities: [
    Tenant,
    User,
    Transportadora,
    Produto,
    CentroDistribuicao,
    TabelaFrete,
    FreightTableUpload,
    FreightTable,
    FreightTableOrigin,
    FreightTableRange,
    FreightTableWeightPrice,
    FreightTableComparisonPrice,
    FreightTableFee,
    RegraFrete,
    Cotacao,
    CotacaoOpcao,
  ],
  migrations: [
    InitialSchema1710000000000,
    OperationalCrudFields1711000000000,
    FreightTableImportsFoundation1712000000000,
    RenameFreightTableModelTypesToWebFretes1713000000000,
  ],
});
