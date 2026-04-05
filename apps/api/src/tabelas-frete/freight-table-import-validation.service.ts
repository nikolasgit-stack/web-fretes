import {
  BadRequestException,
  Injectable,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import * as XLSX from 'xlsx';
import { TenantsService } from '../tenants/tenants.service';
import { TransportadorasService } from '../transportadoras/transportadoras.service';
import { LocalFileStorageService } from '../uploads/local-file-storage.service';
import { FreightTableModelType, FreightTableTariffMode } from './entities/freight-table.enums';
import { ValidateFreightTableDto } from './dto/validate-freight-table.dto';

interface UploadedSpreadsheetFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

interface WorkbookSheetData {
  name: string;
  rows: string[][];
}

interface FreightTableValidationIssue {
  code: string;
  message: string;
  severity: 'error' | 'warning';
  sheet?: string;
  row?: number;
  column?: string;
  value?: string;
}

interface ParsedGeneralSettings {
  nomeTabela: string | null;
  icmsCalculado: number | null;
  cubagem: number | null;
  isencaoCubagem: boolean | null;
  limiteAltura: number | null;
  limiteLargura: number | null;
  limiteComprimento: number | null;
  limiteSomaDimensoes: number | null;
}

interface ParsedOriginRow {
  sheet: string;
  rowNumber: number;
  cepOrigemInicial: string;
  cepOrigemFinal: string;
  metodoExternoId: string;
  centroDistribuicaoId: string | null;
  nomeOrigem: string | null;
}

interface ParsedWeightPrice {
  pesoFaixa: number;
  valor: number;
  ordem: number;
}

interface ParsedComparisonPrice {
  valorPorKg: number | null;
  percentualSobreNF: number | null;
  freteMinimo: number | null;
}

interface ParsedRangeRow {
  sheet: string;
  rowNumber: number;
  metodoExternoId: string | null;
  cepOrigemInicial: string | null;
  cepOrigemFinal: string | null;
  centroDistribuicaoId: string | null;
  nomeOrigem: string | null;
  uf: string | null;
  cidade: string | null;
  cepInicial: string;
  cepFinal: string;
  prazo: number;
  valorMinimoFrete: number | null;
  modoTarifa: FreightTableTariffMode;
  weightPrices: ParsedWeightPrice[];
  comparisonPrice: ParsedComparisonPrice | null;
}

interface ParsedFeeRow {
  sheet: string;
  rowNumber: number;
  metodoExternoId: string | null;
  centroDistribuicaoId: string | null;
  nomeOrigem: string | null;
  uf: string | null;
  cidade: string | null;
  cepInicial: string | null;
  cepFinal: string | null;
  tipoTaxa: string;
  minimo: number | null;
  maximo: number | null;
  percentual: number | null;
  valorFixo: number | null;
  faixaPesoKg: number | null;
  variacaoInicial: number | null;
  variacaoFinal: number | null;
  baseVariacao: string | null;
  valorVariacao: number | null;
  somaComPrimeiroValor: boolean | null;
  modoCobrancaVariacao: string | null;
}

interface HeaderMatchResult {
  rowIndex: number;
  columnByKey: Record<string, number>;
}

interface InlineFeeDefinition {
  columnIndex: number;
  tipoTaxa: string;
  field:
    | 'minimo'
    | 'maximo'
    | 'percentual'
    | 'valorFixo'
    | 'faixaPesoKg'
    | 'variacaoInicial'
    | 'variacaoFinal'
    | 'baseVariacao'
    | 'valorVariacao'
    | 'somaComPrimeiroValor'
    | 'modoCobrancaVariacao';
}

export interface FreightTableValidationResult {
  valido: boolean;
  detectedModel: FreightTableModelType;
  arquivo: {
    nomeOriginal: string;
    storagePath: string;
    tamanhoBytes: number;
  };
  configuracao: ParsedGeneralSettings;
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
    origens: ParsedOriginRow[];
    faixas: ParsedRangeRow[];
    taxas: ParsedFeeRow[];
  };
  issues: FreightTableValidationIssue[];
  parsedData: {
    origens: ParsedOriginRow[];
    faixas: ParsedRangeRow[];
    taxas: ParsedFeeRow[];
  };
}

const GENERAL_SETTING_ALIASES: Record<keyof ParsedGeneralSettings, string[]> = {
  nomeTabela: ['nomedatabela', 'nometabela'],
  icmsCalculado: ['icms', 'icmsincluso', 'icmscalculado'],
  cubagem: ['cubagem', 'fatorcubagem'],
  isencaoCubagem: ['isencaodecubagem', 'isencaocubagem'],
  limiteAltura: ['limitedealtura', 'limitealtura', 'altura'],
  limiteLargura: ['limitedelargura', 'limitelargura', 'largura'],
  limiteComprimento: ['limitedecomprimento', 'limitecomprimento', 'comprimento'],
  limiteSomaDimensoes: ['limitesomadimensoes', 'somadimensoes', 'limitedesomadimensoes'],
};

const RANGE_HEADER_ALIASES: Record<string, string[]> = {
  metodoExternoId: ['idmetodo', 'metodoexternoid', 'idmetodoexterno'],
  centroDistribuicaoId: ['centrodistribuicaoid', 'idcentrodistribuicao', 'centrodistribuicao'],
  nomeOrigem: ['nomeorigem', 'origem'],
  uf: ['uf', 'estado', 'ufdestino'],
  cidade: ['cidade', 'municipio'],
  cepInicial: ['cepi', 'cepinicial', 'cepdestinoinicial'],
  cepFinal: ['cepf', 'cepfinal', 'cepdestinofinal'],
  prazo: ['prazo', 'prazodias', 'prazodiasuteis'],
  valorMinimoFrete: ['valorminimofrete', 'freteminimo', 'valorminimo'],
  valorPorKg: ['valorporkg', 'tarifaporkg'],
  percentualSobreNF: ['percentualsobrenf', 'sobrenf', 'aliquotasobrenf'],
};

const ORIGIN_HEADER_ALIASES: Record<string, string[]> = {
  cepOrigemInicial: ['ceporigeminicial'],
  cepOrigemFinal: ['ceporigemfinal'],
  metodoExternoId: ['idmetodo', 'metodoexternoid', 'idmetodoexterno'],
  centroDistribuicaoId: ['centrodistribuicaoid', 'idcentrodistribuicao', 'centrodistribuicao'],
  nomeOrigem: ['nomeorigem', 'origem'],
};

const FEE_HEADER_ALIASES: Record<string, string[]> = {
  metodoExternoId: ['idmetodo', 'metodoexternoid', 'idmetodoexterno'],
  centroDistribuicaoId: ['centrodistribuicaoid', 'idcentrodistribuicao', 'centrodistribuicao'],
  nomeOrigem: ['nomeorigem', 'origem'],
  uf: ['uf', 'estado', 'ufdestino'],
  cidade: ['cidade', 'municipio'],
  cepInicial: ['cepi', 'cepinicial', 'cepdestinoinicial'],
  cepFinal: ['cepf', 'cepfinal', 'cepdestinofinal'],
  tipoTaxa: ['tipotaxa', 'taxa'],
  minimo: ['minimo', 'valorminimo'],
  maximo: ['maximo', 'valormaximo'],
  percentual: ['percentual', 'aliquota'],
  valorFixo: ['valorfixo'],
  faixaPesoKg: ['faixapesokg', 'pesofaixa'],
  variacaoInicial: ['variacaoinicial'],
  variacaoFinal: ['variacaofinal'],
  baseVariacao: ['basevariacao'],
  valorVariacao: ['valorvariacao'],
  somaComPrimeiroValor: ['somacomprimeirovalor'],
  modoCobrancaVariacao: ['modocobrancavariacao'],
};

@Injectable()
export class FreightTableImportValidationService {
  constructor(
    private readonly tenantsService: TenantsService,
    private readonly transportadorasService: TransportadorasService,
    private readonly localFileStorageService: LocalFileStorageService,
  ) {}

  async validate(
    transportadoraId: string,
    dto: ValidateFreightTableDto,
    file: UploadedSpreadsheetFile | undefined,
  ): Promise<FreightTableValidationResult> {
    return this.validateAndParse(transportadoraId, dto, file);
  }

  async validateAndParse(
    transportadoraId: string,
    dto: ValidateFreightTableDto,
    file: UploadedSpreadsheetFile | undefined,
  ): Promise<FreightTableValidationResult> {
    if (!file) {
      throw new BadRequestException('Arquivo da planilha e obrigatorio');
    }

    this.validateFileMetadata(file);

    await this.tenantsService.findById(dto.tenantId);
    const transportadora = await this.transportadorasService.findById(transportadoraId);

    if (transportadora.tenantId !== dto.tenantId) {
      throw new BadRequestException(
        'A transportadora informada nao pertence ao tenant da importacao',
      );
    }

    const storedFile = await this.localFileStorageService.saveFreightTableFile({
      tenantId: dto.tenantId,
      transportadoraId,
      originalFileName: file.originalname,
      buffer: file.buffer,
    });

    const workbook = XLSX.read(file.buffer, {
      type: 'buffer',
      raw: false,
      cellDates: false,
      cellNF: false,
    });
    const sheets = workbook.SheetNames.map((name) => ({
      name,
      rows: XLSX.utils
        .sheet_to_json<string[]>(workbook.Sheets[name], {
          header: 1,
          raw: false,
          blankrows: false,
          defval: '',
        })
        .map((row) => row.map((cell) => `${cell ?? ''}`.trim())),
    }));
    const issues: FreightTableValidationIssue[] = [];

    if (sheets.length === 0) {
      throw new BadRequestException('A planilha nao contem abas validas');
    }

    const detectedModel = this.detectModel(sheets, dto.tipoTabela, issues);
    const generalSettings = this.parseGeneralSettings(sheets, issues);
    const origins =
      detectedModel === FreightTableModelType.WEB_FRETES_MULTI_ORIGINS
        ? this.parseOrigins(sheets, issues)
        : [];
    const { ranges, fees } = this.parseRanges(sheets, issues);

    this.validateCrossRules({
      issues,
      detectedModel,
      generalSettings,
      origins,
      ranges,
    });

    const errorCount = issues.filter((issue) => issue.severity === 'error').length;
    const warningCount = issues.filter((issue) => issue.severity === 'warning').length;
    const invalidRangeRows = new Set(
      issues
        .filter((issue) => issue.row !== undefined && issue.sheet !== undefined)
        .map((issue) => `${issue.sheet}:${issue.row}`),
    );
    const validRangeRows = Math.max(ranges.length - invalidRangeRows.size, 0);

    return {
      valido: errorCount === 0,
      detectedModel,
      arquivo: {
        nomeOriginal: file.originalname,
        storagePath: storedFile.storagePath,
        tamanhoBytes: file.size,
      },
      configuracao: generalSettings,
      resumo: {
        erros: errorCount,
        avisos: warningCount,
        totalFaixas: ranges.length,
        totalOrigens: origins.length,
        totalTaxas: fees.length,
        linhasValidas: validRangeRows,
        linhasInvalidas: invalidRangeRows.size,
      },
      preview: {
        origens: origins.slice(0, 5),
        faixas: ranges.slice(0, 5),
        taxas: fees.slice(0, 5),
      },
      issues,
      parsedData: {
        origens: origins,
        faixas: ranges,
        taxas: fees,
      },
    };
  }

  private validateFileMetadata(file: UploadedSpreadsheetFile): void {
    const fileName = file.originalname.toLowerCase();

    if (!fileName.endsWith('.xlsx')) {
      throw new UnsupportedMediaTypeException('Somente arquivos .xlsx sao aceitos');
    }

    if (!file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('Arquivo vazio ou indisponivel para leitura');
    }
  }

  private detectModel(
    sheets: WorkbookSheetData[],
    hintedType: FreightTableModelType | undefined,
    issues: FreightTableValidationIssue[],
  ): FreightTableModelType {
    const hasOriginHeaders = this.getOperationalSheets(sheets).some(
      (sheet) =>
        this.findHeaderRow(sheet.rows, ORIGIN_HEADER_ALIASES, [
          'cepOrigemInicial',
          'cepOrigemFinal',
          'metodoExternoId',
        ]) !== null,
    );
    const detected = hasOriginHeaders
      ? FreightTableModelType.WEB_FRETES_MULTI_ORIGINS
      : FreightTableModelType.WEB_FRETES_STANDARD;

    if (hintedType && hintedType !== detected) {
      issues.push({
        code: 'MODEL_HINT_MISMATCH',
        message:
          'O tipo informado nao corresponde a estrutura detectada automaticamente na planilha.',
        severity: 'error',
      });
    }

    return hintedType ?? detected;
  }

  private parseGeneralSettings(
    sheets: WorkbookSheetData[],
    issues: FreightTableValidationIssue[],
  ): ParsedGeneralSettings {
    const result: ParsedGeneralSettings = {
      nomeTabela: null,
      icmsCalculado: null,
      cubagem: null,
      isencaoCubagem: null,
      limiteAltura: null,
      limiteLargura: null,
      limiteComprimento: null,
      limiteSomaDimensoes: null,
    };

    for (const [field, aliases] of Object.entries(GENERAL_SETTING_ALIASES)) {
      const match = this.findLabelValue(this.getOperationalSheets(sheets), aliases);
      if (!match) {
        continue;
      }

      if (field === 'nomeTabela') {
        result.nomeTabela = match.value;
        continue;
      }

      if (field === 'isencaoCubagem') {
        result.isencaoCubagem = this.parseBooleanLike(match.value);
        continue;
      }

      const numericValue = this.parseNumber(match.value);

      if (field === 'icmsCalculado' && numericValue === null) {
        const booleanValue = this.parseBooleanLike(match.value);

        if (booleanValue !== null) {
          result.icmsCalculado = booleanValue ? 1 : 0;
          continue;
        }
      }

      if (numericValue === null) {
        issues.push({
          code: 'GENERAL_SETTING_INVALID',
          message: `O valor de ${field} nao pode ser interpretado numericamente.`,
          severity: 'error',
          sheet: match.sheet,
          row: match.rowNumber,
          value: match.value,
        });
        continue;
      }

      result[field as keyof ParsedGeneralSettings] = numericValue as never;
    }

    return result;
  }

  private parseOrigins(
    sheets: WorkbookSheetData[],
    issues: FreightTableValidationIssue[],
  ): ParsedOriginRow[] {
    const origins: ParsedOriginRow[] = [];
    const seenOrigins = new Set<string>();

    for (const sheet of this.getOperationalSheets(sheets)) {
      const header = this.findHeaderRow(sheet.rows, ORIGIN_HEADER_ALIASES, [
        'cepOrigemInicial',
        'cepOrigemFinal',
        'metodoExternoId',
      ]);

      if (!header) {
        continue;
      }

      for (let rowIndex = header.rowIndex + 1; rowIndex < sheet.rows.length; rowIndex += 1) {
        const row = sheet.rows[rowIndex];

        if (!this.hasOriginRowData(row, header)) {
          continue;
        }

        const cepOrigemInicial = this.getCell(row, header.columnByKey.cepOrigemInicial);
        const cepOrigemFinal = this.getCell(row, header.columnByKey.cepOrigemFinal);
        const metodoExternoId = this.getCell(row, header.columnByKey.metodoExternoId);
        const originKey = `${cepOrigemInicial}|${cepOrigemFinal}|${metodoExternoId}`;

        if (seenOrigins.has(originKey)) {
          continue;
        }

        seenOrigins.add(originKey);

        origins.push({
          sheet: sheet.name,
          rowNumber: rowIndex + 1,
          cepOrigemInicial,
          cepOrigemFinal,
          metodoExternoId,
          centroDistribuicaoId:
            this.getCell(row, header.columnByKey.centroDistribuicaoId) || null,
          nomeOrigem: this.getCell(row, header.columnByKey.nomeOrigem) || null,
        });

        this.validateNumericCep(
          cepOrigemInicial,
          sheet.name,
          rowIndex + 1,
          'cepOrigemInicial',
          issues,
        );
        this.validateNumericCep(
          cepOrigemFinal,
          sheet.name,
          rowIndex + 1,
          'cepOrigemFinal',
          issues,
        );

        if (metodoExternoId === '') {
          issues.push({
            code: 'ORIGIN_METHOD_REQUIRED',
            message: 'ID do metodo e obrigatorio no modelo multi origens.',
            severity: 'error',
            sheet: sheet.name,
            row: rowIndex + 1,
            column: 'metodoExternoId',
          });
        }

        if (cepOrigemInicial !== '' && cepOrigemFinal !== '' && cepOrigemInicial > cepOrigemFinal) {
          issues.push({
            code: 'ORIGIN_CEP_RANGE_INVALID',
            message: 'CEP origem inicial nao pode ser maior que o CEP origem final.',
            severity: 'error',
            sheet: sheet.name,
            row: rowIndex + 1,
          });
        }
      }
    }

    return origins;
  }

  private parseRanges(
    sheets: WorkbookSheetData[],
    issues: FreightTableValidationIssue[],
  ): { ranges: ParsedRangeRow[]; fees: ParsedFeeRow[] } {
    const ranges: ParsedRangeRow[] = [];
    const fees: ParsedFeeRow[] = [];
    let parsedAnyRange = false;

    for (const sheet of this.getOperationalSheets(sheets)) {
      const header = this.findHeaderRow(sheet.rows, RANGE_HEADER_ALIASES, ['cepInicial', 'cepFinal', 'prazo']);

      if (!header) {
        continue;
      }

      parsedAnyRange = true;
      const weightColumns = this.extractWeightColumns(sheet.rows[header.rowIndex]);
      const comparisonColumns = this.extractComparisonColumns(header.columnByKey);
      const inlineFeeDefinitions = this.extractInlineFeeDefinitions(
        sheet.rows[header.rowIndex],
        header,
        weightColumns,
        comparisonColumns,
      );

      for (let rowIndex = header.rowIndex + 1; rowIndex < sheet.rows.length; rowIndex += 1) {
        const row = sheet.rows[rowIndex];

        if (!this.hasRangeRowData(row, header)) {
          continue;
        }

        const cepInicial = this.getCell(row, header.columnByKey.cepInicial);
        const cepFinal = this.getCell(row, header.columnByKey.cepFinal);
        const prazoRaw = this.getCell(row, header.columnByKey.prazo);
        const rowWeightPrices = weightColumns
          .map((column, index) => ({
            pesoFaixa: column.weight,
            valor: this.parseNumber(this.getCell(row, column.index)) ?? Number.NaN,
            ordem: index + 1,
          }))
          .filter((item) => !Number.isNaN(item.valor));
        const comparisonPrice = {
          valorPorKg: this.parseNumber(
            this.getOptionalCell(row, comparisonColumns.valorPorKg),
          ),
          percentualSobreNF: this.parseNumber(
            this.getOptionalCell(row, comparisonColumns.percentualSobreNF),
          ),
          freteMinimo: this.parseNumber(
            this.getOptionalCell(row, comparisonColumns.valorMinimoFrete),
          ),
        };
        const hasWeightMode = rowWeightPrices.length > 0;
        const hasComparisonMode =
          comparisonPrice.valorPorKg !== null ||
          comparisonPrice.percentualSobreNF !== null ||
          comparisonPrice.freteMinimo !== null;

        const parsedRange: ParsedRangeRow = {
          sheet: sheet.name,
          rowNumber: rowIndex + 1,
          metodoExternoId: this.getOptionalCell(row, header.columnByKey.metodoExternoId),
          cepOrigemInicial: this.getOptionalCell(row, header.columnByKey.cepOrigemInicial),
          cepOrigemFinal: this.getOptionalCell(row, header.columnByKey.cepOrigemFinal),
          centroDistribuicaoId: this.getOptionalCell(row, header.columnByKey.centroDistribuicaoId),
          nomeOrigem: this.getOptionalCell(row, header.columnByKey.nomeOrigem),
          uf: this.getOptionalCell(row, header.columnByKey.uf),
          cidade: this.getOptionalCell(row, header.columnByKey.cidade),
          cepInicial,
          cepFinal,
          prazo: this.parseNumber(prazoRaw) ?? Number.NaN,
          valorMinimoFrete: this.parseNumber(
            this.getOptionalCell(row, header.columnByKey.valorMinimoFrete),
          ),
          modoTarifa: hasWeightMode
            ? FreightTableTariffMode.WEIGHT
            : FreightTableTariffMode.COMPARISON,
          weightPrices: rowWeightPrices,
          comparisonPrice: hasComparisonMode ? comparisonPrice : null,
        };

        this.validateNumericCep(cepInicial, sheet.name, rowIndex + 1, 'cepInicial', issues);
        this.validateNumericCep(cepFinal, sheet.name, rowIndex + 1, 'cepFinal', issues);

        if (cepInicial !== '' && cepFinal !== '' && cepInicial > cepFinal) {
          issues.push({
            code: 'DESTINATION_CEP_RANGE_INVALID',
            message: 'CEPI nao pode ser maior que CEPF.',
            severity: 'error',
            sheet: sheet.name,
            row: rowIndex + 1,
          });
        }

        if (!Number.isFinite(parsedRange.prazo)) {
          issues.push({
            code: 'PRAZO_REQUIRED',
            message: 'Prazo e obrigatorio e deve ser numerico.',
            severity: 'error',
            sheet: sheet.name,
            row: rowIndex + 1,
            column: 'prazo',
            value: prazoRaw,
          });
        }

        if (hasWeightMode && hasComparisonMode) {
          issues.push({
            code: 'TARIFF_MODE_CONFLICT',
            message:
              'A linha nao pode misturar frete por peso e frete por comparacao ao mesmo tempo.',
            severity: 'error',
            sheet: sheet.name,
            row: rowIndex + 1,
          });
        } else if (!hasWeightMode && !hasComparisonMode) {
          issues.push({
            code: 'TARIFF_MODE_MISSING',
            message:
              'Informe frete por peso ou frete por comparacao na linha.',
            severity: 'error',
            sheet: sheet.name,
            row: rowIndex + 1,
          });
        }

        for (const price of parsedRange.weightPrices) {
          if (price.valor < 0) {
            issues.push({
              code: 'WEIGHT_PRICE_NEGATIVE',
              message: 'Valores de tarifa por peso nao podem ser negativos.',
              severity: 'error',
              sheet: sheet.name,
              row: rowIndex + 1,
            });
          }
        }

        ranges.push(parsedRange);
        fees.push(
          ...this.buildInlineFeesForRow(
            inlineFeeDefinitions,
            row,
            sheet.name,
            rowIndex + 1,
            parsedRange,
          ),
        );
      }
    }

    if (!parsedAnyRange) {
      issues.push({
        code: 'RANGE_BLOCK_NOT_FOUND',
        message:
          'Nao foi encontrado um bloco de abrangencia/tarifas com os cabecalhos obrigatorios.',
        severity: 'error',
      });
    }

    return {
      ranges,
      fees: this.consolidateFees(fees, issues),
    };
  }

  private validateCrossRules(input: {
    issues: FreightTableValidationIssue[];
    detectedModel: FreightTableModelType;
    generalSettings: ParsedGeneralSettings;
    origins: ParsedOriginRow[];
    ranges: ParsedRangeRow[];
  }): void {
    if (!input.generalSettings.nomeTabela) {
      input.issues.push({
        code: 'TABLE_NAME_REQUIRED',
        message: 'Nome da tabela e obrigatorio.',
        severity: 'error',
      });
    }

    if (input.generalSettings.icmsCalculado === null) {
      input.issues.push({
        code: 'ICMS_REQUIRED',
        message: 'ICMS e obrigatorio para a importacao.',
        severity: 'error',
      });
    }

    if (input.detectedModel === FreightTableModelType.WEB_FRETES_MULTI_ORIGINS) {
      if (input.origins.length === 0) {
        input.issues.push({
          code: 'MULTI_ORIGINS_REQUIRED',
          message:
            'O modelo Web Fretes Multi Origens exige bloco ou aba com CEP origem inicial/final e ID metodo.',
          severity: 'error',
        });
      }
    }

    if (input.ranges.length === 0) {
      input.issues.push({
        code: 'RANGE_ROW_REQUIRED',
        message: 'A planilha precisa conter ao menos uma faixa de abrangencia valida.',
        severity: 'error',
      });
    }

    const invalidWeightHeaders = input.ranges.some((range) => {
      const weights = range.weightPrices.map((item) => item.pesoFaixa);
      return weights.some((weight, index) => index > 0 && weight <= weights[index - 1]);
    });

    if (invalidWeightHeaders) {
      input.issues.push({
        code: 'WEIGHT_RANGE_INVALID',
        message: 'As faixas de peso devem ser crescentes e coerentes.',
        severity: 'error',
      });
    }
  }

  private getOperationalSheets(sheets: WorkbookSheetData[]): WorkbookSheetData[] {
    const operationalSheets = sheets.filter(
      (sheet) => !this.normalizeCell(sheet.name).includes('instruc'),
    );

    return operationalSheets.length > 0 ? operationalSheets : sheets;
  }

  private hasRangeRowData(row: string[], header: HeaderMatchResult): boolean {
    const cepInicial = this.getCell(row, header.columnByKey.cepInicial);
    const cepFinal = this.getCell(row, header.columnByKey.cepFinal);
    const prazo = this.getCell(row, header.columnByKey.prazo);
    const cepOrigemInicial = this.getCell(row, header.columnByKey.cepOrigemInicial);
    const cepOrigemFinal = this.getCell(row, header.columnByKey.cepOrigemFinal);

    return (
      /^\d+$/.test(cepInicial) ||
      /^\d+$/.test(cepFinal) ||
      this.parseNumber(prazo) !== null ||
      /^\d+$/.test(cepOrigemInicial) ||
      /^\d+$/.test(cepOrigemFinal)
    );
  }

  private hasOriginRowData(row: string[], header: HeaderMatchResult): boolean {
    const relevantIndexes = [
      header.columnByKey.cepOrigemInicial,
      header.columnByKey.cepOrigemFinal,
      header.columnByKey.metodoExternoId,
      header.columnByKey.nomeOrigem,
      header.columnByKey.centroDistribuicaoId,
    ].filter((value): value is number => value !== undefined);

    return relevantIndexes.some((index) => this.getCell(row, index) !== '');
  }

  private findLabelValue(
    sheets: WorkbookSheetData[],
    aliases: string[],
  ): { sheet: string; rowNumber: number; value: string } | null {
    for (const sheet of sheets) {
      for (let rowIndex = 0; rowIndex < sheet.rows.length; rowIndex += 1) {
        const row = sheet.rows[rowIndex];

        for (let columnIndex = 0; columnIndex < row.length; columnIndex += 1) {
          const normalized = this.normalizeCell(row[columnIndex]);

          if (
            !aliases.some(
              (alias) => normalized === alias || normalized.startsWith(alias),
            )
          ) {
            continue;
          }

          const value =
            row
              .slice(columnIndex + 1)
              .find((cell) => `${cell ?? ''}`.trim() !== '') ??
            this.findNextValueInColumn(sheet.rows, rowIndex, columnIndex, 1);

          if (value !== undefined) {
            return {
              sheet: sheet.name,
              rowNumber: rowIndex + 1,
              value,
            };
          }
        }
      }
    }

    return null;
  }

  private findNextValueInColumn(
    rows: string[][],
    rowIndex: number,
    columnIndex: number,
    maxLookahead: number,
  ): string | undefined {
    const allSettingAliases = Object.values(GENERAL_SETTING_ALIASES).flat();

    for (let offset = 1; offset <= maxLookahead; offset += 1) {
      const candidate = rows[rowIndex + offset]?.[columnIndex];
      const normalizedCandidate = this.normalizeCell(candidate);

      if (
        `${candidate ?? ''}`.trim() !== '' &&
        !allSettingAliases.some(
          (alias) =>
            normalizedCandidate === alias || normalizedCandidate.startsWith(alias),
        ) &&
        !/limite|cubagem|ceporigem|nometabela|nomedatabela|isencao/.test(
          normalizedCandidate,
        )
      ) {
        return candidate;
      }
    }

    return undefined;
  }

  private findWorkbookTitleCell(sheets: WorkbookSheetData[]): string | null {
    for (const sheet of sheets) {
      for (const row of sheet.rows.slice(0, 12)) {
        for (const cell of row) {
          const normalized = this.normalizeCell(cell);

          if (normalized.includes('tabeladefrete')) {
            return cell;
          }
        }
      }
    }

    return null;
  }

  private findHeaderRow(
    rows: string[][],
    aliasesByKey: Record<string, string[]>,
    requiredKeys?: string[],
  ): HeaderMatchResult | null {
    const keysToRequire = requiredKeys ?? Object.keys(aliasesByKey);

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
      const row = rows[rowIndex];
      const columnByKey: Record<string, number> = {};

      for (let columnIndex = 0; columnIndex < row.length; columnIndex += 1) {
        const normalizedCell = this.normalizeCell(row[columnIndex]);

        for (const [key, aliases] of Object.entries(aliasesByKey)) {
          if (aliases.some((alias) => normalizedCell === alias || normalizedCell.includes(alias))) {
            columnByKey[key] = columnIndex;
          }
        }
      }

      if (keysToRequire.every((key) => columnByKey[key] !== undefined)) {
        return {
          rowIndex,
          columnByKey,
        };
      }
    }

    return null;
  }

  private extractWeightColumns(row: string[]): Array<{ index: number; weight: number }> {
    return row
      .map((cell, index) => ({
        index,
        weight: this.parseWeightHeader(cell),
      }))
      .filter((item) => item.weight !== null)
      .map((item) => ({
        index: item.index,
        weight: item.weight as number,
      }));
  }

  private extractComparisonColumns(
    columnByKey: Record<string, number>,
  ): Record<string, number> {
    const comparisonColumns: Record<string, number> = {};

    if (columnByKey.valorPorKg !== undefined) {
      comparisonColumns.valorPorKg = columnByKey.valorPorKg;
    }

    if (columnByKey.percentualSobreNF !== undefined) {
      comparisonColumns.percentualSobreNF = columnByKey.percentualSobreNF;
    }

    if (columnByKey.valorMinimoFrete !== undefined) {
      comparisonColumns.valorMinimoFrete = columnByKey.valorMinimoFrete;
    }

    return comparisonColumns;
  }

  private extractInlineFeeDefinitions(
    headerRow: string[],
    header: HeaderMatchResult,
    weightColumns: Array<{ index: number; weight: number }>,
    comparisonColumns: Record<string, number>,
  ): InlineFeeDefinition[] {
    const reservedColumns = new Set<number>([
      ...Object.values(header.columnByKey),
      ...weightColumns.map((item) => item.index),
      ...Object.values(comparisonColumns),
    ]);

    const definitions: InlineFeeDefinition[] = [];

    for (let columnIndex = 0; columnIndex < headerRow.length; columnIndex += 1) {
      if (reservedColumns.has(columnIndex)) {
        continue;
      }

      const definition = this.parseInlineFeeDefinition(headerRow[columnIndex], columnIndex);
      if (definition) {
        definitions.push(definition);
      }
    }

    return definitions;
  }

  private parseInlineFeeDefinition(
    headerValue: string,
    columnIndex: number,
  ): InlineFeeDefinition | null {
    const value = `${headerValue ?? ''}`.trim();

    if (!value) {
      return null;
    }

    const normalized = this.normalizeCell(value);
    if (
      !normalized ||
      normalized === 'valorexcedente' ||
      normalized === 'fretevalor' ||
      normalized === 'valorporkg' ||
      normalized === 'sobreanf' ||
      normalized === 'freteminimo'
    ) {
      return null;
    }

    const matchers: Array<{
      pattern: RegExp;
      field: InlineFeeDefinition['field'];
    }> = [
      { pattern: /^(.*?)\s+M[ÍI]NIMO$/i, field: 'minimo' },
      { pattern: /^(.*?)\s+M[ÁA]XIMO$/i, field: 'maximo' },
      { pattern: /^(.*?)\s*\(%\)\s*-\s*DENTRO DA VARIA[ÇC][ÃA]O$/i, field: 'valorVariacao' },
      { pattern: /^(.*?)\s+FIXO\s*-\s*DENTRO DA VARIA[ÇC][ÃA]O$/i, field: 'valorVariacao' },
      { pattern: /^FAIXA DE PESO \(KG\) D[AO]\s+(.*?)\s+FIXO(?:\s*-\s*DENTRO DA VARIA[ÇC][ÃA]O)?$/i, field: 'faixaPesoKg' },
      { pattern: /^VALOR INICIAL DA VARIA[ÇC][ÃA]O D[EO]\s+(.*?)$/i, field: 'variacaoInicial' },
      { pattern: /^VALOR FINAL DA VARIA[ÇC][ÃA]O D[EO]\s+(.*?)$/i, field: 'variacaoFinal' },
      { pattern: /^BASE DA VARIA[ÇC][ÃA]O D[EO]\s+(.*?)(?:\s+\(.*)?$/i, field: 'baseVariacao' },
      { pattern: /^(.*?)\s+DA VARIA[ÇC][ÃA]O SOMA COM PRIMEIRO VALOR\?/i, field: 'somaComPrimeiroValor' },
      { pattern: /^(.*?)\s+DA VARIA[ÇC][ÃA]O COBRADO SOBRE DIFEREN[ÇC]A OU VALOR COMPLETO\?/i, field: 'modoCobrancaVariacao' },
      { pattern: /^(.*?)\s*\(%\)(?:\s*-\s*SOBRE A NF)?$/i, field: 'percentual' },
      { pattern: /^(.*?)\s+FIXO$/i, field: 'valorFixo' },
    ];

    for (const matcher of matchers) {
      const match = value.match(matcher.pattern);
      if (!match) {
        continue;
      }

      const tipoTaxa = match[1].trim();
      if (!tipoTaxa || /^FRETE/i.test(tipoTaxa)) {
        return null;
      }

      return {
        columnIndex,
        tipoTaxa,
        field: matcher.field,
      };
    }

    return null;
  }

  private buildInlineFeesForRow(
    definitions: InlineFeeDefinition[],
    row: string[],
    sheet: string,
    rowNumber: number,
    range: ParsedRangeRow,
  ): ParsedFeeRow[] {
    const feeMap = new Map<string, ParsedFeeRow>();

    for (const definition of definitions) {
      const rawValue = this.getCell(row, definition.columnIndex);
      if (rawValue === '') {
        continue;
      }

      const key = definition.tipoTaxa.toUpperCase();
      if (!feeMap.has(key)) {
        feeMap.set(key, {
          sheet,
          rowNumber,
          metodoExternoId: range.metodoExternoId,
          centroDistribuicaoId: range.centroDistribuicaoId,
          nomeOrigem: range.nomeOrigem,
          uf: range.uf,
          cidade: range.cidade,
          cepInicial: range.cepInicial,
          cepFinal: range.cepFinal,
          tipoTaxa: definition.tipoTaxa,
          minimo: null,
          maximo: null,
          percentual: null,
          valorFixo: null,
          faixaPesoKg: null,
          variacaoInicial: null,
          variacaoFinal: null,
          baseVariacao: null,
          valorVariacao: null,
          somaComPrimeiroValor: null,
          modoCobrancaVariacao: null,
        });
      }

      const fee = feeMap.get(key)!;

      switch (definition.field) {
        case 'baseVariacao':
        case 'modoCobrancaVariacao':
          fee[definition.field] = rawValue || null;
          break;
        case 'somaComPrimeiroValor':
          fee.somaComPrimeiroValor = this.parseNullableBoolean(rawValue);
          break;
        default:
          fee[definition.field] = this.parseNumber(rawValue);
          break;
      }
    }

    return Array.from(feeMap.values());
  }

  private consolidateFees(
    fees: ParsedFeeRow[],
    issues: FreightTableValidationIssue[],
  ): ParsedFeeRow[] {
    for (const fee of fees) {
      if (
        fee.minimo !== null &&
        fee.maximo !== null &&
        fee.minimo > fee.maximo
      ) {
        issues.push({
          code: 'FEE_MIN_MAX_INVALID',
          message: 'Valor minimo da taxa nao pode ser maior que o valor maximo.',
          severity: 'error',
          sheet: fee.sheet,
          row: fee.rowNumber,
        });
      }

      if (
        fee.variacaoInicial !== null &&
        fee.variacaoFinal !== null &&
        fee.variacaoInicial > fee.variacaoFinal
      ) {
        issues.push({
          code: 'FEE_VARIATION_INVALID',
          message: 'Variacao inicial nao pode ser maior que a variacao final.',
          severity: 'error',
          sheet: fee.sheet,
          row: fee.rowNumber,
        });
      }
    }

    return fees;
  }

  private parseWeightHeader(value: string): number | null {
    const sanitized = value.replace(/\s+/g, '').replace(',', '.');

    if (!/^\d+(\.\d+)?$/.test(sanitized)) {
      return null;
    }

    const numericValue = Number(sanitized);
    return Number.isFinite(numericValue) ? numericValue : null;
  }

  private validateNumericCep(
    value: string,
    sheet: string,
    row: number,
    column: string,
    issues: FreightTableValidationIssue[],
  ): void {
    if (value === '') {
      issues.push({
        code: 'CEP_REQUIRED',
        message: `${column} e obrigatorio.`,
        severity: 'error',
        sheet,
        row,
        column,
      });
      return;
    }

    if (!/^\d+$/.test(value)) {
      issues.push({
        code: 'CEP_NUMERIC_REQUIRED',
        message: `${column} deve ser numerico.`,
        severity: 'error',
        sheet,
        row,
        column,
        value,
      });
    }
  }

  private parseNumber(value: string | null | undefined): number | null {
    if (!value) {
      return null;
    }

    const trimmed = value.trim();
    let sanitized = trimmed;

    if (trimmed.includes('.') && trimmed.includes(',')) {
      sanitized = trimmed.replace(/\./g, '').replace(/,/g, '.');
    } else if (trimmed.includes(',')) {
      sanitized = trimmed.replace(/,/g, '.');
    }

    sanitized = sanitized.replace(/[^\d.-]/g, '');

    if (!sanitized || sanitized === '-' || sanitized === '.') {
      return null;
    }

    const parsed = Number(sanitized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private parseBooleanLike(value: string | null | undefined): boolean | null {
    if (!value) {
      return null;
    }

    const normalized = this.normalizeCell(value);

    if (['s', 'sim', 'true', '1', 'yes'].includes(normalized)) {
      return true;
    }

    if (['n', 'nao', 'false', '0', 'no'].includes(normalized)) {
      return false;
    }

    return null;
  }

  private parseNullableBoolean(value: string | null | undefined): boolean | null {
    return this.parseBooleanLike(value);
  }

  private normalizeCell(value: string | null | undefined): string {
    return `${value ?? ''}`
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '');
  }

  private getCell(row: string[], index: number | undefined): string {
    if (index === undefined) {
      return '';
    }

    return `${row[index] ?? ''}`.trim();
  }

  private getOptionalCell(row: string[], index: number | undefined): string | null {
    const value = this.getCell(row, index);
    return value === '' ? null : value;
  }

  private isRowBlank(row: string[]): boolean {
    return row.every((cell) => `${cell ?? ''}`.trim() === '');
  }
}
