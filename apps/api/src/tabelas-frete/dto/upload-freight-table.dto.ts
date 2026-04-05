import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { FreightTableModelType } from '../entities/freight-table.enums';

export class UploadFreightTableDto {
  @IsUUID()
  tenantId!: string;

  @IsOptional()
  @IsEnum(FreightTableModelType)
  tipoTabela?: FreightTableModelType;

  @IsOptional()
  @IsString()
  importadoPor?: string;
}
