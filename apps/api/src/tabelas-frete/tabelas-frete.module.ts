import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CentrosDistribuicaoModule } from '../centros-distribuicao/centros-distribuicao.module';
import { TenantsModule } from '../tenants/tenants.module';
import { TransportadorasModule } from '../transportadoras/transportadoras.module';
import { TabelaFrete } from './entities/tabela-frete.entity';
import { TabelasFreteController } from './tabelas-frete.controller';
import { TabelasFreteService } from './tabelas-frete.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TabelaFrete]),
    TenantsModule,
    TransportadorasModule,
    CentrosDistribuicaoModule,
  ],
  controllers: [TabelasFreteController],
  providers: [TabelasFreteService],
  exports: [TabelasFreteService],
})
export class TabelasFreteModule {}
