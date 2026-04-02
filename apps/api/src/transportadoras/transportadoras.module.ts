import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantsModule } from '../tenants/tenants.module';
import { Transportadora } from './entities/transportadora.entity';
import { TransportadorasController } from './transportadoras.controller';
import { TransportadorasService } from './transportadoras.service';

@Module({
  imports: [TypeOrmModule.forFeature([Transportadora]), TenantsModule],
  controllers: [TransportadorasController],
  providers: [TransportadorasService],
  exports: [TransportadorasService],
})
export class TransportadorasModule {}
