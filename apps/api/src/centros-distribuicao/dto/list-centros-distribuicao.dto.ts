import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, IsUUID, Length, MaxLength } from 'class-validator';

export class ListCentrosDistribuicaoDto {
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
  @Length(8, 8)
  cep?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  cidade?: string;

  @IsOptional()
  @IsString()
  @Length(2, 2)
  estado?: string;

  @IsOptional()
  @Transform(({ value }) => `${value}`.toLowerCase())
  @IsIn(['true', 'false'])
  ativo?: string;
}
