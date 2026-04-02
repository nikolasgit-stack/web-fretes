import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  nome!: string;

  @IsString()
  @Matches(/^[a-z0-9-]+$/)
  @MaxLength(120)
  @Transform(({ value }) => String(value).trim().toLowerCase())
  slug!: string;
}
