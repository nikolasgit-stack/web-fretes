import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProdutoDto {
  @IsUUID()
  tenantId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  sku!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  nome!: string;

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
