import { CentroDistribuicao } from '../centros-distribuicao/types';
import { Transportadora } from '../transportadoras/types';

export interface RegraFrete {
  id: string;
  tenantId: string;
  nome: string;
  marketplace: string | null;
  transportadoraId: string | null;
  centroDistribuicaoId: string | null;
  ufDestino: string | null;
  cepInicial: string | null;
  cepFinal: string | null;
  pesoMin: number | null;
  pesoMax: number | null;
  prioridade: number;
  ativo: boolean;
  observacao: string | null;
  criadoEm: string;
  atualizadoEm: string;
  transportadora?: Pick<Transportadora, 'id' | 'nome' | 'codigoInterno' | 'ativo'>;
  centroDistribuicao?: Pick<CentroDistribuicao, 'id' | 'nome' | 'codigoInterno' | 'ativo'>;
}

export interface RegraFretePayload {
  tenantId: string;
  nome: string;
  marketplace?: string;
  transportadoraId: string;
  centroDistribuicaoId: string;
  ufDestino?: string;
  cepInicial?: string;
  cepFinal?: string;
  pesoMin?: number;
  pesoMax?: number;
  prioridade: number;
  observacao?: string;
  ativo?: boolean;
}
