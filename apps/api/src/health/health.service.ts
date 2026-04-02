import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class HealthService {
  constructor(private readonly dataSource: DataSource) {}

  async check(): Promise<{
    status: 'ok' | 'degraded';
    service: string;
    timestamp: string;
    database: 'up' | 'down';
  }> {
    let database: 'up' | 'down' = 'up';

    try {
      await this.dataSource.query('SELECT 1');
    } catch {
      database = 'down';
    }

    return {
      status: database === 'up' ? 'ok' : 'degraded',
      service: 'web-fretes-api',
      timestamp: new Date().toISOString(),
      database,
    };
  }
}
