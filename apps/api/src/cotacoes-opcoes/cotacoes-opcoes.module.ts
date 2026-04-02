import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CotacaoOpcao } from './entities/cotacao-opcao.entity';
import { CotacoesOpcoesService } from './cotacoes-opcoes.service';

@Module({
  imports: [TypeOrmModule.forFeature([CotacaoOpcao])],
  providers: [CotacoesOpcoesService],
  exports: [CotacoesOpcoesService],
})
export class CotacoesOpcoesModule {}
