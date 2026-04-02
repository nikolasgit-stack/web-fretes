import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { CentrosDistribuicaoModule } from './centros-distribuicao/centros-distribuicao.module';
import { CommonModule } from './common/common.module';
import { ConfigModule } from './config/config.module';
import { AppConfigService } from './config/app-config.service';
import { CotacoesModule } from './cotacoes/cotacoes.module';
import { CotacoesOpcoesModule } from './cotacoes-opcoes/cotacoes-opcoes.module';
import { HealthModule } from './health/health.module';
import { ProdutosModule } from './produtos/produtos.module';
import { RegrasFreteModule } from './regras-frete/regras-frete.module';
import { SimulacoesModule } from './simulacoes/simulacoes.module';
import { TabelasFreteModule } from './tabelas-frete/tabelas-frete.module';
import { TenantsModule } from './tenants/tenants.module';
import { TransportadorasModule } from './transportadoras/transportadoras.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => ({
        type: 'postgres',
        host: configService.database.host,
        port: configService.database.port,
        username: configService.database.username,
        password: configService.database.password,
        database: configService.database.name,
        ssl: configService.database.ssl ? { rejectUnauthorized: false } : false,
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    CommonModule,
    HealthModule,
    AuthModule,
    TenantsModule,
    UsersModule,
    TransportadorasModule,
    ProdutosModule,
    CentrosDistribuicaoModule,
    TabelasFreteModule,
    RegrasFreteModule,
    CotacoesOpcoesModule,
    SimulacoesModule,
    CotacoesModule,
  ],
})
export class AppModule {}
