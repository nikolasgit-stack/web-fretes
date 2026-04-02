import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
  Min,
  ValidateNested,
  IsNumber,
  IsInt,
} from 'class-validator';

export class SimularCotacaoItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  sku!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantidade!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  peso!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  altura!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  largura!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  comprimento!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  valor!: number;
}

export class SimularCotacaoDto {
  @IsUUID()
  tenantId!: string;

  @IsString()
  @Length(8, 8)
  cepDestino!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SimularCotacaoItemDto)
  itens!: SimularCotacaoItemDto[];

  @IsOptional()
  @IsString()
  @MaxLength(100)
  marketplace?: string;
}
