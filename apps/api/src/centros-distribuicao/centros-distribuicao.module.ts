import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantsModule } from '../tenants/tenants.module';
import { CentroDistribuicao } from './entities/centro-distribuicao.entity';
import { CentrosDistribuicaoController } from './centros-distribuicao.controller';
import { CentrosDistribuicaoService } from './centros-distribuicao.service';

@Module({
  imports: [TypeOrmModule.forFeature([CentroDistribuicao]), TenantsModule],
  controllers: [CentrosDistribuicaoController],
  providers: [CentrosDistribuicaoService],
  exports: [CentrosDistribuicaoService],
})
export class CentrosDistribuicaoModule {}
