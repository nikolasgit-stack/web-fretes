import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantsModule } from '../tenants/tenants.module';
import { RegraFrete } from './entities/regra-frete.entity';
import { RegrasFreteController } from './regras-frete.controller';
import { RegrasFreteService } from './regras-frete.service';

@Module({
  imports: [TypeOrmModule.forFeature([RegraFrete]), TenantsModule],
  controllers: [RegrasFreteController],
  providers: [RegrasFreteService],
  exports: [RegrasFreteService],
})
export class RegrasFreteModule {}
