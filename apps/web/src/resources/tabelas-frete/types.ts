export type FreightTableModelType =
  | 'intelipost_padrao'
  | 'intelipost_multi_origens';

export type FreightTableUploadStatus =
  | 'recebido'
  | 'validado'
  | 'erro_validacao'
  | 'importado';

export interface FreightTableListItem {
  id: string;
  tenantId: string;
  transportadoraId: string;
  uploadId: string | null;
  nomeTabela: string;
  tipoTabela: FreightTableModelType;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
  nomeArquivoOriginal: string | null;
  status: FreightTableUploadStatus | null;
  resumo: {
    erros?: number;
    avisos?: number;
    totalFaixas?: number;
    totalOrigens?: number;
    totalTaxas?: number;
    linhasValidas?: number;
    linhasInvalidas?: number;
  } | null;
}

export interface FreightTableValidationIssue {
  code: string;
  message: string;
  severity: 'error' | 'warning';
  sheet?: string;
  row?: number;
  column?: string;
  value?: string;
}

export interface FreightTableValidationResponse {
  valido: boolean;
  detectedModel: FreightTableModelType;
  arquivo: {
    nomeOriginal: string;
    storagePath: string;
    tamanhoBytes: number;
  };
  configuracao: {
    nomeTabela: string | null;
    icmsCalculado: number | null;
    cubagem: number | null;
    isencaoCubagem: boolean | null;
    limiteAltura: number | null;
    limiteLargura: number | null;
    limiteComprimento: number | null;
    limiteSomaDimensoes: number | null;
  };
  resumo: {
    erros: number;
    avisos: number;
    totalFaixas: number;
    totalOrigens: number;
    totalTaxas: number;
    linhasValidas: number;
    linhasInvalidas: number;
  };
  preview: {
    origens: Array<Record<string, unknown>>;
    faixas: Array<Record<string, unknown>>;
    taxas: Array<Record<string, unknown>>;
  };
  issues: FreightTableValidationIssue[];
}

export interface FreightTablePreviewResponse {
  table: {
    id: string;
    nomeTabela: string;
    tipoTabela: FreightTableModelType;
    ativo: boolean;
  };
  resumo: Record<string, unknown> | null;
  preview: {
    origens: Array<Record<string, unknown>>;
    faixas: Array<Record<string, unknown>>;
  };
}
