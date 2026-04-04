import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { FreightTableModelType } from '../entities/freight-table.enums';

export class ValidateFreightTableDto {
  @IsUUID()
  tenantId!: string;

  @IsOptional()
  @IsEnum(FreightTableModelType)
  tipoTabela?: FreightTableModelType;
}
