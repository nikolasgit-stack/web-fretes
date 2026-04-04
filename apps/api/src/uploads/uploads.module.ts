import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { LocalFileStorageService } from './local-file-storage.service';

@Module({
  imports: [ConfigModule],
  providers: [LocalFileStorageService],
  exports: [LocalFileStorageService],
})
export class UploadsModule {}
