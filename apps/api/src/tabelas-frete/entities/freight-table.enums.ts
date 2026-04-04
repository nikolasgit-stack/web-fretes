export enum FreightTableModelType {
  INTELIPOST_STANDARD = 'intelipost_padrao',
  INTELIPOST_MULTI_ORIGINS = 'intelipost_multi_origens',
}

export enum FreightTableUploadStatus {
  RECEIVED = 'recebido',
  VALIDATED = 'validado',
  VALIDATION_ERROR = 'erro_validacao',
  IMPORTED = 'importado',
}

export enum FreightTableTariffMode {
  WEIGHT = 'peso',
  COMPARISON = 'comparacao',
}
