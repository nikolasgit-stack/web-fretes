import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cotacao } from './entities/cotacao.entity';
import { CotacoesController } from './cotacoes.controller';
import { CotacoesService } from './cotacoes.service';
import { SimulacoesModule } from '../simulacoes/simulacoes.module';

@Module({
  imports: [TypeOrmModule.forFeature([Cotacao]), forwardRef(() => SimulacoesModule)],
  controllers: [CotacoesController],
  providers: [CotacoesService],
  exports: [CotacoesService],
})
export class CotacoesModule {}
