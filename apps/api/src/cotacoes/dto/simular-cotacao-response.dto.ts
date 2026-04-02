import { CotacaoStatus } from '../entities/cotacao.entity';

export interface SimulacaoDetalhamentoDto {
  valorProdutos: number;
  pesoTotal: number;
  volumeTotal: number;
  transportadorasConsideradas: number;
  tabelasConsideradas: number;
  tabelasDescartadas: number;
  regrasAvaliadas: number;
  regrasAplicadas: string[];
  criterioEscolha: string;
  fallbackAcionado: boolean;
  motivoFallback: string | null;
}

export interface SimulacaoOpcaoDto {
  id: string;
  transportadoraId: string;
  transportadoraNome: string;
  metodoEnvio: string;
  prazo: number;
  tarifa: number;
  tarifaExibida: number;
  ativa: boolean;
  semCobertura: boolean;
  retiradaCotacao: boolean;
  regra: string | null;
  prioridadeRegra: number | null;
  motivoDescarte: string | null;
  detalheJson: Record<string, unknown>;
}

export interface SimulacaoResumoDto {
  titulo: string;
  descricao: string;
  quantidadeOpcoes: number;
  possuiMelhorOpcao: boolean;
}

export interface SimularCotacaoResponseDto {
  cotacaoId: string;
  status: CotacaoStatus;
  melhorOpcao: SimulacaoOpcaoDto | null;
  opcoes: SimulacaoOpcaoDto[];
  detalhamento: SimulacaoDetalhamentoDto;
  resumo: SimulacaoResumoDto;
}
