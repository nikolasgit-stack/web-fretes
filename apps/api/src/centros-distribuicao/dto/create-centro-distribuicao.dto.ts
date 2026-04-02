import {
  IsNotEmpty,
  IsString,
  IsUUID,
  Length,
  MaxLength,
} from 'class-validator';

export class CreateCentroDistribuicaoDto {
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

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  cidade!: string;

  @IsString()
  @Length(2, 2)
  estado!: string;
}
