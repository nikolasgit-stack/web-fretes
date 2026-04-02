export type TipoIntegracaoTransportadora = 'manual' | 'api' | 'hub';

export interface Transportadora {
  id: string;
  tenantId: string;
  nome: string;
  codigoInterno: string;
  modalidade: string | null;
  tipoIntegracao: TipoIntegracaoTransportadora;
  contato: string | null;
  observacao: string | null;
  ativo: boolean;
  prazoCd: number;
  cubagem: number;
  isencaoCubagem: boolean;
  icmsIncluso: boolean;
  estadoOrigem: string;
  linhaBranca: boolean;
  limiteAltura: number | null;
  limiteLargura: number | null;
  limiteComprimento: number | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface TransportadoraPayload {
  tenantId: string;
  nome: string;
  codigoInterno: string;
  modalidade?: string;
  tipoIntegracao: TipoIntegracaoTransportadora;
  contato?: string;
  observacao?: string;
  prazoCd: number;
  cubagem: number;
  isencaoCubagem: boolean;
  icmsIncluso: boolean;
  estadoOrigem: string;
  linhaBranca: boolean;
  limiteAltura?: number;
  limiteLargura?: number;
  limiteComprimento?: number;
  ativo?: boolean;
}
