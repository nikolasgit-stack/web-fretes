import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { AppConfigService } from '../config/app-config.service';

@Injectable()
export class LocalFileStorageService {
  constructor(private readonly configService: AppConfigService) {}

  async saveFreightTableFile(input: {
    tenantId: string;
    transportadoraId: string;
    originalFileName: string;
    buffer: Buffer;
  }): Promise<{ storagePath: string }> {
    const sanitizedFileName = input.originalFileName.replace(/[^\w.\-]+/g, '_');
    const relativeDirectory = join(
      'freight-tables',
      input.tenantId,
      input.transportadoraId,
    );
    const fileName = `${Date.now()}-${randomUUID()}-${sanitizedFileName}`;
    const targetDirectory = join(this.configService.storage.basePath, relativeDirectory);
    const absolutePath = join(targetDirectory, fileName);

    await mkdir(targetDirectory, { recursive: true });
    await writeFile(absolutePath, input.buffer);

    return {
      storagePath: join(relativeDirectory, fileName).replace(/\\/g, '/'),
    };
  }

  async readFile(storagePath: string): Promise<{ buffer: Buffer; absolutePath: string }> {
    const normalizedPath = storagePath.replace(/\//g, '\\');
    const absolutePath = join(this.configService.storage.basePath, normalizedPath);
    const buffer = await readFile(absolutePath);

    return {
      buffer,
      absolutePath,
    };
  }
}
