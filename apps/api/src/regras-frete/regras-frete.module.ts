import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CentroDistribuicao } from '../centros-distribuicao/entities/centro-distribuicao.entity';
import { TenantsModule } from '../tenants/tenants.module';
import { Transportadora } from '../transportadoras/entities/transportadora.entity';
import { RegraFrete } from './entities/regra-frete.entity';
import { RegrasFreteController } from './regras-frete.controller';
import { RegrasFreteService } from './regras-frete.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RegraFrete, Transportadora, CentroDistribuicao]),
    TenantsModule,
  ],
  controllers: [RegrasFreteController],
  providers: [RegrasFreteService],
  exports: [RegrasFreteService],
})
export class RegrasFreteModule {}
