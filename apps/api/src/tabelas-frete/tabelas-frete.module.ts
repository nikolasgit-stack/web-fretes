import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CentrosDistribuicaoModule } from '../centros-distribuicao/centros-distribuicao.module';
import { TenantsModule } from '../tenants/tenants.module';
import { TransportadorasModule } from '../transportadoras/transportadoras.module';
import { UploadsModule } from '../uploads/uploads.module';
import { FreightTableComparisonPrice } from './entities/freight-table-comparison-price.entity';
import { FreightTableFee } from './entities/freight-table-fee.entity';
import { FreightTableOrigin } from './entities/freight-table-origin.entity';
import { FreightTableRange } from './entities/freight-table-range.entity';
import { FreightTableUpload } from './entities/freight-table-upload.entity';
import { FreightTableWeightPrice } from './entities/freight-table-weight-price.entity';
import { FreightTable } from './entities/freight-table.entity';
import { FreightTableImportValidationService } from './freight-table-import-validation.service';
import { TabelaFrete } from './entities/tabela-frete.entity';
import { TabelasFreteController } from './tabelas-frete.controller';
import { TabelasFreteService } from './tabelas-frete.service';
import { TransportadoraTabelasFreteController } from './transportadora-tabelas-frete.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TabelaFrete,
      FreightTableUpload,
      FreightTable,
      FreightTableOrigin,
      FreightTableRange,
      FreightTableWeightPrice,
      FreightTableComparisonPrice,
      FreightTableFee,
    ]),
    TenantsModule,
    TransportadorasModule,
    CentrosDistribuicaoModule,
    UploadsModule,
  ],
  controllers: [TabelasFreteController, TransportadoraTabelasFreteController],
  providers: [TabelasFreteService, FreightTableImportValidationService],
  exports: [TabelasFreteService],
})
export class TabelasFreteModule {}
