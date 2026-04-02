import { Module, forwardRef } from '@nestjs/common';
import { CotacoesOpcoesModule } from '../cotacoes-opcoes/cotacoes-opcoes.module';
import { CotacoesModule } from '../cotacoes/cotacoes.module';
import { RegrasFreteModule } from '../regras-frete/regras-frete.module';
import { TabelasFreteModule } from '../tabelas-frete/tabelas-frete.module';
import { TenantsModule } from '../tenants/tenants.module';
import { DecisionEngineService } from './decision-engine.service';
import { SimulacoesService } from './simulacoes.service';

@Module({
  imports: [
    TenantsModule,
    TabelasFreteModule,
    RegrasFreteModule,
    CotacoesOpcoesModule,
    forwardRef(() => CotacoesModule),
  ],
  providers: [SimulacoesService, DecisionEngineService],
  exports: [SimulacoesService, DecisionEngineService],
})
export class SimulacoesModule {}
