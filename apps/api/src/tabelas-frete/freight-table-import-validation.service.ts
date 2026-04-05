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
      detectedModel === FreightTableModelType.INTELIPOST_MULTI_ORIGINS
        ? this.parseOrigins(sheets, issues)
        : [];
    const ranges = this.parseRanges(sheets, issues);
    const fees = this.parseFees(sheets, issues);

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
    const hasOriginHeaders = sheets.some(
      (sheet) => this.findHeaderRow(sheet.rows, ORIGIN_HEADER_ALIASES) !== null,
    );
    const detected = hasOriginHeaders
      ? FreightTableModelType.INTELIPOST_MULTI_ORIGINS
      : FreightTableModelType.INTELIPOST_STANDARD;

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
      const match = this.findLabelValue(sheets, aliases);
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

    if (!result.nomeTabela) {
      const titleCell = this.findWorkbookTitleCell(sheets);
      result.nomeTabela = titleCell;
    }

    return result;
  }

  private parseOrigins(
    sheets: WorkbookSheetData[],
    issues: FreightTableValidationIssue[],
  ): ParsedOriginRow[] {
    const origins: ParsedOriginRow[] = [];

    for (const sheet of sheets) {
      const header = this.findHeaderRow(sheet.rows, ORIGIN_HEADER_ALIASES);

      if (!header) {
        continue;
      }

      for (let rowIndex = header.rowIndex + 1; rowIndex < sheet.rows.length; rowIndex += 1) {
        const row = sheet.rows[rowIndex];

        if (this.isRowBlank(row)) {
          break;
        }

        const cepOrigemInicial = this.getCell(row, header.columnByKey.cepOrigemInicial);
        const cepOrigemFinal = this.getCell(row, header.columnByKey.cepOrigemFinal);
        const metodoExternoId = this.getCell(row, header.columnByKey.metodoExternoId);

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
  ): ParsedRangeRow[] {
    const ranges: ParsedRangeRow[] = [];
    let parsedAnyRange = false;

    for (const sheet of sheets) {
      const header = this.findHeaderRow(sheet.rows, RANGE_HEADER_ALIASES, ['cepInicial', 'cepFinal', 'prazo']);

      if (!header) {
        continue;
      }

      parsedAnyRange = true;
      const weightColumns = this.extractWeightColumns(sheet.rows[header.rowIndex]);
      const comparisonColumns = this.extractComparisonColumns(header.columnByKey);

      if (weightColumns.length > 0 && Object.keys(comparisonColumns).length > 0) {
        issues.push({
          code: 'TARIFF_MODE_CONFLICT',
          message:
            'A mesma tabela nao pode misturar frete por peso e frete por comparacao no mesmo bloco.',
          severity: 'error',
          sheet: sheet.name,
          row: header.rowIndex + 1,
        });
      }

      if (weightColumns.length === 0 && Object.keys(comparisonColumns).length === 0) {
        issues.push({
          code: 'TARIFF_MODE_MISSING',
          message:
            'Nao foi possivel identificar colunas de tarifa por peso nem colunas de comparacao.',
          severity: 'error',
          sheet: sheet.name,
          row: header.rowIndex + 1,
        });
      }

      for (let rowIndex = header.rowIndex + 1; rowIndex < sheet.rows.length; rowIndex += 1) {
        const row = sheet.rows[rowIndex];

        if (this.isRowBlank(row)) {
          break;
        }

        const cepInicial = this.getCell(row, header.columnByKey.cepInicial);
        const cepFinal = this.getCell(row, header.columnByKey.cepFinal);
        const prazoRaw = this.getCell(row, header.columnByKey.prazo);

        const parsedRange: ParsedRangeRow = {
          sheet: sheet.name,
          rowNumber: rowIndex + 1,
          metodoExternoId: this.getOptionalCell(row, header.columnByKey.metodoExternoId),
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
          modoTarifa:
            weightColumns.length > 0
              ? FreightTableTariffMode.WEIGHT
              : FreightTableTariffMode.COMPARISON,
          weightPrices: [],
          comparisonPrice: null,
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

        if (weightColumns.length > 0) {
          parsedRange.weightPrices = weightColumns
            .map((column, index) => ({
              pesoFaixa: column.weight,
              valor: this.parseNumber(this.getCell(row, column.index)) ?? Number.NaN,
              ordem: index + 1,
            }))
            .filter((item) => !Number.isNaN(item.valor));

          if (parsedRange.weightPrices.length === 0) {
            issues.push({
              code: 'WEIGHT_PRICE_REQUIRED',
              message: 'Ao menos uma tarifa por faixa de peso deve ser informada.',
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
        } else {
          parsedRange.comparisonPrice = {
            valorPorKg: this.parseNumber(this.getOptionalCell(row, comparisonColumns.valorPorKg)),
            percentualSobreNF: this.parseNumber(
              this.getOptionalCell(row, comparisonColumns.percentualSobreNF),
            ),
            freteMinimo: this.parseNumber(
              this.getOptionalCell(row, comparisonColumns.valorMinimoFrete),
            ),
          };

          if (
            !parsedRange.comparisonPrice.valorPorKg &&
            !parsedRange.comparisonPrice.percentualSobreNF &&
            !parsedRange.comparisonPrice.freteMinimo
          ) {
            issues.push({
              code: 'COMPARISON_PRICE_REQUIRED',
              message:
                'No modo comparacao, informe valor por kg, percentual sobre NF ou frete minimo.',
              severity: 'error',
              sheet: sheet.name,
              row: rowIndex + 1,
            });
          }
        }

        ranges.push(parsedRange);
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

    return ranges;
  }

  private parseFees(
    sheets: WorkbookSheetData[],
    issues: FreightTableValidationIssue[],
  ): ParsedFeeRow[] {
    const fees: ParsedFeeRow[] = [];

    for (const sheet of sheets) {
      const header = this.findHeaderRow(sheet.rows, FEE_HEADER_ALIASES, ['tipoTaxa']);

      if (!header) {
        continue;
      }

      for (let rowIndex = header.rowIndex + 1; rowIndex < sheet.rows.length; rowIndex += 1) {
        const row = sheet.rows[rowIndex];

        if (this.isRowBlank(row)) {
          break;
        }

        const fee: ParsedFeeRow = {
          sheet: sheet.name,
          rowNumber: rowIndex + 1,
          metodoExternoId: this.getOptionalCell(row, header.columnByKey.metodoExternoId),
          centroDistribuicaoId: this.getOptionalCell(row, header.columnByKey.centroDistribuicaoId),
          nomeOrigem: this.getOptionalCell(row, header.columnByKey.nomeOrigem),
          uf: this.getOptionalCell(row, header.columnByKey.uf),
          cidade: this.getOptionalCell(row, header.columnByKey.cidade),
          cepInicial: this.getOptionalCell(row, header.columnByKey.cepInicial),
          cepFinal: this.getOptionalCell(row, header.columnByKey.cepFinal),
          tipoTaxa: this.getCell(row, header.columnByKey.tipoTaxa),
          minimo: this.parseNumber(this.getOptionalCell(row, header.columnByKey.minimo)),
          maximo: this.parseNumber(this.getOptionalCell(row, header.columnByKey.maximo)),
          percentual: this.parseNumber(this.getOptionalCell(row, header.columnByKey.percentual)),
          valorFixo: this.parseNumber(this.getOptionalCell(row, header.columnByKey.valorFixo)),
          faixaPesoKg: this.parseNumber(this.getOptionalCell(row, header.columnByKey.faixaPesoKg)),
          variacaoInicial: this.parseNumber(
            this.getOptionalCell(row, header.columnByKey.variacaoInicial),
          ),
          variacaoFinal: this.parseNumber(
            this.getOptionalCell(row, header.columnByKey.variacaoFinal),
          ),
          baseVariacao: this.getOptionalCell(row, header.columnByKey.baseVariacao),
          valorVariacao: this.parseNumber(
            this.getOptionalCell(row, header.columnByKey.valorVariacao),
          ),
          somaComPrimeiroValor: this.parseNullableBoolean(
            this.getOptionalCell(row, header.columnByKey.somaComPrimeiroValor),
          ),
          modoCobrancaVariacao: this.getOptionalCell(
            row,
            header.columnByKey.modoCobrancaVariacao,
          ),
        };

        if (!fee.tipoTaxa) {
          issues.push({
            code: 'FEE_TYPE_REQUIRED',
            message: 'Tipo de taxa e obrigatorio.',
            severity: 'error',
            sheet: sheet.name,
            row: rowIndex + 1,
          });
        }

        if (
          fee.minimo !== null &&
          fee.maximo !== null &&
          fee.minimo > fee.maximo
        ) {
          issues.push({
            code: 'FEE_MIN_MAX_INVALID',
            message: 'Valor minimo da taxa nao pode ser maior que o valor maximo.',
            severity: 'error',
            sheet: sheet.name,
            row: rowIndex + 1,
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
            sheet: sheet.name,
            row: rowIndex + 1,
          });
        }

        fees.push(fee);
      }
    }

    return fees;
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

    if (input.detectedModel === FreightTableModelType.INTELIPOST_MULTI_ORIGINS) {
      if (input.origins.length === 0) {
        input.issues.push({
          code: 'MULTI_ORIGINS_REQUIRED',
          message:
            'O modelo Intelipost Multi Origens exige bloco ou aba com CEP origem inicial/final e ID metodo.',
          severity: 'error',
        });
      }
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

  private findLabelValue(
    sheets: WorkbookSheetData[],
    aliases: string[],
  ): { sheet: string; rowNumber: number; value: string } | null {
    for (const sheet of sheets) {
      for (let rowIndex = 0; rowIndex < sheet.rows.length; rowIndex += 1) {
        const row = sheet.rows[rowIndex];

        for (let columnIndex = 0; columnIndex < row.length; columnIndex += 1) {
          const normalized = this.normalizeCell(row[columnIndex]);

          if (!aliases.some((alias) => normalized.includes(alias))) {
            continue;
          }

          const value = row
            .slice(columnIndex + 1)
            .find((cell) => `${cell ?? ''}`.trim() !== '');

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
