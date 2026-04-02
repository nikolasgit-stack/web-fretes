import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegraFrete } from '../regras-frete/entities/regra-frete.entity';
import { TabelaFrete } from '../tabelas-frete/entities/tabela-frete.entity';
import { TenantsModule } from '../tenants/tenants.module';
import { Transportadora } from './entities/transportadora.entity';
import { TransportadorasController } from './transportadoras.controller';
import { TransportadorasService } from './transportadoras.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transportadora, TabelaFrete, RegraFrete]),
    TenantsModule,
  ],
  controllers: [TransportadorasController],
  providers: [TransportadorasService],
  exports: [TransportadorasService],
})
export class TransportadorasModule {}
