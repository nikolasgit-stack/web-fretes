import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
  Min,
} from 'class-validator';
import {
  TipoIntegracaoTransportadora,
} from '../entities/transportadora.entity';

export class CreateTransportadoraDto {
  @IsUUID()
  tenantId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  nome!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  codigoInterno!: string;

  @IsEnum(TipoIntegracaoTransportadora)
  tipoIntegracao!: TipoIntegracaoTransportadora;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  prazoCd!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cubagem!: number;

  @IsBoolean()
  isencaoCubagem!: boolean;

  @IsBoolean()
  icmsIncluso!: boolean;

  @IsString()
  @Length(2, 2)
  estadoOrigem!: string;

  @IsBoolean()
  linhaBranca!: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  limiteAltura?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  limiteLargura?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  limiteComprimento?: number;
}
