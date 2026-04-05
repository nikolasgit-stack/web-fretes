export enum FreightTableModelType {
  WEB_FRETES_STANDARD = 'web_fretes_padrao',
  WEB_FRETES_MULTI_ORIGINS = 'web_fretes_multi_origens',
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
