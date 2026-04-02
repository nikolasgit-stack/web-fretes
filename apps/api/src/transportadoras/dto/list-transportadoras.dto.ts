import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, IsUUID, Length, MaxLength } from 'class-validator';
import { TipoIntegracaoTransportadora } from '../entities/transportadora.entity';

export class ListTransportadorasDto {
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  nome?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  codigoInterno?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  modalidade?: string;

  @IsOptional()
  @IsIn(Object.values(TipoIntegracaoTransportadora))
  tipoIntegracao?: TipoIntegracaoTransportadora;

  @IsOptional()
  @Transform(({ value }) => `${value}`.toLowerCase())
  @IsIn(['true', 'false'])
  ativo?: string;

  @IsOptional()
  @IsString()
  @Length(2, 2)
  estadoOrigem?: string;
}
