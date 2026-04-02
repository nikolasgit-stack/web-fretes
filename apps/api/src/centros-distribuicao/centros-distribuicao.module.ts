import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegraFrete } from '../regras-frete/entities/regra-frete.entity';
import { TabelaFrete } from '../tabelas-frete/entities/tabela-frete.entity';
import { TenantsModule } from '../tenants/tenants.module';
import { CentroDistribuicao } from './entities/centro-distribuicao.entity';
import { CentrosDistribuicaoController } from './centros-distribuicao.controller';
import { CentrosDistribuicaoService } from './centros-distribuicao.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CentroDistribuicao, TabelaFrete, RegraFrete]),
    TenantsModule,
  ],
  controllers: [CentrosDistribuicaoController],
  providers: [CentrosDistribuicaoService],
  exports: [CentrosDistribuicaoService],
})
export class CentrosDistribuicaoModule {}
