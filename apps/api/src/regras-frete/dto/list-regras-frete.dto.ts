import { Transform } from 'class-transformer';
import {
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
} from 'class-validator';

export class ListRegrasFreteDto {
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  nome?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  marketplace?: string;

  @IsOptional()
  @IsUUID()
  transportadoraId?: string;

  @IsOptional()
  @IsUUID()
  centroDistribuicaoId?: string;

  @IsOptional()
  @IsString()
  @Length(2, 2)
  ufDestino?: string;

  @IsOptional()
  @IsString()
  @Length(8, 8)
  cepInicial?: string;

  @IsOptional()
  @IsString()
  @Length(8, 8)
  cepFinal?: string;

  @IsOptional()
  @IsString()
  pesoMin?: string;

  @IsOptional()
  @IsString()
  pesoMax?: string;

  @IsOptional()
  @Transform(({ value }) => `${value}`.toLowerCase())
  @IsIn(['true', 'false'])
  ativo?: string;
}
