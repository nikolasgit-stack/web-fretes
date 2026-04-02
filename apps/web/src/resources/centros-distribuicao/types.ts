export interface CentroDistribuicao {
  id: string;
  tenantId: string;
  nome: string;
  codigoInterno: string;
  cep: string | null;
  cidade: string;
  estado: string;
  endereco: string | null;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface CentroDistribuicaoPayload {
  tenantId: string;
  nome: string;
  codigoInterno: string;
  cep?: string;
  cidade: string;
  estado: string;
  endereco?: string;
  ativo?: boolean;
}
