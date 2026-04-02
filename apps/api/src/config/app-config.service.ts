import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from './app.config';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  private get app(): AppConfig {
    return this.configService.get<AppConfig>('app', { infer: true }) as AppConfig;
  }

  get nodeEnv(): string {
    return this.app.nodeEnv;
  }

  get port(): number {
    return this.app.port;
  }

  get apiPrefix(): string {
    return this.app.apiPrefix;
  }

  get database(): AppConfig['database'] {
    return this.app.database;
  }

  get storage(): AppConfig['storage'] {
    return this.app.storage;
  }
}
