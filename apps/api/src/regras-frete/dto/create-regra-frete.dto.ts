import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
  Min,
  ValidateIf,
  IsNumber,
} from 'class-validator';

export class CreateRegraFreteDto {
  @IsUUID()
  tenantId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  nome!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  marketplace?: string;

  @IsOptional()
  @IsString()
  @Length(2, 2)
  ufDestino?: string;

  @ValidateIf((object) => object.pesoMin !== undefined)
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  pesoMin?: number;

  @ValidateIf((object) => object.pesoMax !== undefined)
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  pesoMax?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  prioridade!: number;
}
