import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { TipoTabelaFrete } from '../entities/tabela-frete.entity';

export class CreateTabelaFreteDto {
  @IsUUID()
  tenantId!: string;

  @IsUUID()
  transportadoraId!: string;

  @IsUUID()
  centroDistribuicaoId!: string;

  @IsDateString()
  vigenciaInicio!: string;

  @IsOptional()
  @IsDateString()
  vigenciaFim?: string;

  @IsEnum(TipoTabelaFrete)
  tipoTabela!: TipoTabelaFrete;
}
