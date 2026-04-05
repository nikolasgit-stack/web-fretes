import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CentrosDistribuicaoService } from '../centros-distribuicao/centros-distribuicao.service';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { TenantsService } from '../tenants/tenants.service';
import { TransportadorasService } from '../transportadoras/transportadoras.service';
import { CreateTabelaFreteDto } from './dto/create-tabela-frete.dto';
import { ListTransportadoraFreightTablesDto } from './dto/list-transportadora-freight-tables.dto';
import { UploadFreightTableDto } from './dto/upload-freight-table.dto';
import { FreightTableImportValidationService } from './freight-table-import-validation.service';
import { FreightTableComparisonPrice } from './entities/freight-table-comparison-price.entity';
import { FreightTableFee } from './entities/freight-table-fee.entity';
import { FreightTableOrigin } from './entities/freight-table-origin.entity';
import { FreightTableRange } from './entities/freight-table-range.entity';
import { FreightTableUpload } from './entities/freight-table-upload.entity';
import {
  FreightTableModelType,
  FreightTableTariffMode,
  FreightTableUploadStatus,
} from './entities/freight-table.enums';
import { FreightTableWeightPrice } from './entities/freight-table-weight-price.entity';
import { FreightTable } from './entities/freight-table.entity';
import { TabelaFrete } from './entities/tabela-frete.entity';

@Injectable()
export class TabelasFreteService {
  constructor(
    @InjectRepository(TabelaFrete)
    private readonly tabelasFreteRepository: Repository<TabelaFrete>,
    @InjectRepository(FreightTableUpload)
    private readonly freightTableUploadsRepository: Repository<FreightTableUpload>,
    @InjectRepository(FreightTable)
    private readonly freightTablesRepository: Repository<FreightTable>,
    @InjectRepository(FreightTableOrigin)
    private readonly freightTableOriginsRepository: Repository<FreightTableOrigin>,
    @InjectRepository(FreightTableRange)
    private readonly freightTableRangesRepository: Repository<FreightTableRange>,
    @InjectRepository(FreightTableWeightPrice)
    private readonly freightTableWeightPricesRepository: Repository<FreightTableWeightPrice>,
    @InjectRepository(FreightTableComparisonPrice)
    private readonly freightTableComparisonPricesRepository: Repository<FreightTableComparisonPrice>,
    @InjectRepository(FreightTableFee)
    private readonly freightTableFeesRepository: Repository<FreightTableFee>,
    private readonly tenantsService: TenantsService,
    private readonly transportadorasService: TransportadorasService,
    private readonly centrosDistribuicaoService: CentrosDistribuicaoService,
    private readonly freightTableImportValidationService: FreightTableImportValidationService,
  ) {}

  async findAll(): Promise<TabelaFrete[]> {
    return this.tabelasFreteRepository.find({
      relations: {
        transportadora: true,
        centroDistribuicao: true,
      },
      order: {
        criadoEm: 'DESC',
      },
    });
  }

  async findById(id: string): Promise<TabelaFrete> {
    const tabelaFrete = await this.tabelasFreteRepository.findOne({
      where: { id },
      relations: {
        transportadora: true,
        centroDistribuicao: true,
      },
    });

    if (!tabelaFrete) {
      throw new NotFoundException('Tabela de frete not found');
    }

    return tabelaFrete;
  }

  async create(createTabelaFreteDto: CreateTabelaFreteDto): Promise<TabelaFrete> {
    await this.tenantsService.findById(createTabelaFreteDto.tenantId);

    const transportadora = await this.transportadorasService.findById(
      createTabelaFreteDto.transportadoraId,
    );
    const centroDistribuicao = await this.centrosDistribuicaoService.findById(
      createTabelaFreteDto.centroDistribuicaoId,
    );

    if (
      transportadora.tenantId !== createTabelaFreteDto.tenantId ||
      centroDistribuicao.tenantId !== createTabelaFreteDto.tenantId
    ) {
      throw new ConflictException(
        'Transportadora e centro de distribuicao devem pertencer ao mesmo tenant da tabela',
      );
    }

    const existing = await this.tabelasFreteRepository.findOne({
      where: {
        tenantId: createTabelaFreteDto.tenantId,
        transportadoraId: createTabelaFreteDto.transportadoraId,
        centroDistribuicaoId: createTabelaFreteDto.centroDistribuicaoId,
        tipoTabela: createTabelaFreteDto.tipoTabela,
        vigenciaInicio: createTabelaFreteDto.vigenciaInicio,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Ja existe tabela de frete com a mesma combinacao para este tenant',
      );
    }

    const tabelaFrete = this.tabelasFreteRepository.create({
      ...createTabelaFreteDto,
      ativa: true,
      vigenciaFim: createTabelaFreteDto.vigenciaFim ?? null,
    });

    return this.tabelasFreteRepository.save(tabelaFrete);
  }

  async validateUpload(
    transportadoraId: string,
    dto: UploadFreightTableDto,
    file:
      | {
      originalname: string;
      mimetype: string;
      size: number;
      buffer: Buffer;
    }
      | undefined,
  ) {
    return this.freightTableImportValidationService.validateAndParse(
      transportadoraId,
      dto,
      file,
    );
  }

  async upload(
    transportadoraId: string,
    dto: UploadFreightTableDto,
    file:
      | {
      originalname: string;
      mimetype: string;
      size: number;
      buffer: Buffer;
    }
      | undefined,
  ): Promise<Record<string, unknown>> {
    const validationResult = await this.freightTableImportValidationService.validateAndParse(
      transportadoraId,
      dto,
      file,
    );
    const validationSummary = validationResult as unknown as Record<string, unknown>;

    if (!validationResult.valido) {
      throw new ConflictException(
        'A planilha possui erros de validacao e nao pode ser importada.',
      );
    }

    const transportadora = await this.transportadorasService.findById(transportadoraId);

    if (transportadora.tenantId !== dto.tenantId) {
      throw new ConflictException(
        'A transportadora informada nao pertence ao tenant da importacao.',
      );
    }

    const { uploadRecord, tableRecord } = await this.freightTablesRepository.manager.transaction(
      async (manager) => {
        const uploadRepository = manager.getRepository(FreightTableUpload);
        const tableRepository = manager.getRepository(FreightTable);
        const originRepository = manager.getRepository(FreightTableOrigin);
        const rangeRepository = manager.getRepository(FreightTableRange);
        const weightPriceRepository = manager.getRepository(FreightTableWeightPrice);
        const comparisonPriceRepository = manager.getRepository(FreightTableComparisonPrice);
        const feeRepository = manager.getRepository(FreightTableFee);

        const uploadRecord = await uploadRepository.save(
          uploadRepository.create({
            tenantId: dto.tenantId,
            transportadoraId,
            tipoTabela: validationResult.detectedModel,
            nomeArquivoOriginal: validationResult.arquivo.nomeOriginal,
            storagePath: validationResult.arquivo.storagePath,
            status: FreightTableUploadStatus.VALIDATED,
            resumoValidacaoJson: validationSummary,
            importadoPor: dto.importadoPor?.trim() ?? null,
          }),
        );

        const tableRecord = await tableRepository.save(
          tableRepository.create({
            tenantId: dto.tenantId,
            transportadoraId,
            uploadId: uploadRecord.id,
            tipoTabela: validationResult.detectedModel,
            nomeTabela:
              validationResult.configuracao.nomeTabela ??
              validationResult.arquivo.nomeOriginal,
            icmsCalculado: validationResult.configuracao.icmsCalculado ?? 0,
            cubagem: validationResult.configuracao.cubagem,
            isencaoCubagem: validationResult.configuracao.isencaoCubagem ?? false,
            limiteAltura: validationResult.configuracao.limiteAltura,
            limiteLargura: validationResult.configuracao.limiteLargura,
            limiteComprimento: validationResult.configuracao.limiteComprimento,
            limiteSomaDimensoes: validationResult.configuracao.limiteSomaDimensoes,
            ativo: true,
          }),
        );

        const originByKey = new Map<string, FreightTableOrigin>();
        for (const origin of validationResult.parsedData.origens) {
          const savedOrigin = await originRepository.save(
            originRepository.create({
              freightTableId: tableRecord.id,
              cepOrigemInicial: origin.cepOrigemInicial,
              cepOrigemFinal: origin.cepOrigemFinal,
              metodoExternoId: origin.metodoExternoId,
              centroDistribuicaoId: origin.centroDistribuicaoId,
              nomeOrigem: origin.nomeOrigem,
            }),
          );

          originByKey.set(this.buildOriginKey(origin), savedOrigin);
        }

        const rangeByKey = new Map<string, FreightTableRange>();
        for (const range of validationResult.parsedData.faixas) {
          const matchedOrigin = this.matchOriginForRange(
            validationResult.detectedModel,
            range,
            validationResult.parsedData.origens,
            originByKey,
          );

          const savedRange = await rangeRepository.save(
            rangeRepository.create({
              freightTableId: tableRecord.id,
              originId: matchedOrigin?.id ?? null,
              uf: range.uf,
              cidade: range.cidade,
              cepInicial: range.cepInicial,
              cepFinal: range.cepFinal,
              prazo: range.prazo,
              valorMinimoFrete: range.valorMinimoFrete,
              modoTarifa: range.modoTarifa,
            }),
          );

          rangeByKey.set(this.buildRangeKey(range), savedRange);

          if (range.modoTarifa === FreightTableTariffMode.WEIGHT) {
            for (const price of range.weightPrices) {
              await weightPriceRepository.save(
                weightPriceRepository.create({
                  rangeId: savedRange.id,
                  pesoFaixa: price.pesoFaixa,
                  valor: price.valor,
                  ordem: price.ordem,
                }),
              );
            }
          } else if (range.comparisonPrice) {
            await comparisonPriceRepository.save(
              comparisonPriceRepository.create({
                rangeId: savedRange.id,
                valorPorKg: range.comparisonPrice.valorPorKg,
                percentualSobreNF: range.comparisonPrice.percentualSobreNF,
                freteMinimo: range.comparisonPrice.freteMinimo,
              }),
            );
          }
        }

        for (const fee of validationResult.parsedData.taxas) {
          const matchedRange = this.matchRangeForFee(
            fee,
            validationResult.parsedData.faixas,
            rangeByKey,
          );

          if (!matchedRange && validationResult.parsedData.faixas.length > 1) {
            continue;
          }

          const fallbackRange =
            matchedRange ??
            rangeByKey.get(this.buildRangeKey(validationResult.parsedData.faixas[0])) ??
            null;

          if (!fallbackRange) {
            continue;
          }

          await feeRepository.save(
            feeRepository.create({
              rangeId: fallbackRange.id,
              tipoTaxa: fee.tipoTaxa,
              minimo: fee.minimo,
              maximo: fee.maximo,
              percentual: fee.percentual,
              valorFixo: fee.valorFixo,
              faixaPesoKg: fee.faixaPesoKg,
              variacaoInicial: fee.variacaoInicial,
              variacaoFinal: fee.variacaoFinal,
              baseVariacao: fee.baseVariacao,
              valorVariacao: fee.valorVariacao,
              somaComPrimeiroValor: fee.somaComPrimeiroValor,
              modoCobrancaVariacao: fee.modoCobrancaVariacao,
            }),
          );
        }

        uploadRecord.status = FreightTableUploadStatus.IMPORTED;
        uploadRecord.resumoValidacaoJson = {
          ...validationSummary,
          uploadId: uploadRecord.id,
          freightTableId: tableRecord.id,
        };
        await uploadRepository.save(uploadRecord);

        return { uploadRecord, tableRecord };
      },
    );

    return {
      uploadId: uploadRecord.id,
      freightTableId: tableRecord.id,
      status: uploadRecord.status,
      resumo: validationResult.resumo,
      detectedModel: validationResult.detectedModel,
    };
  }

  async listByTransportadora(
    transportadoraId: string,
    query: ListTransportadoraFreightTablesDto,
  ): Promise<PaginatedResponse<Record<string, unknown>>> {
    await this.ensureTransportadoraWithinTenant(transportadoraId, query.tenantId);

    const page = query.page;
    const limit = query.limit;
    const [tables, total] = await this.freightTablesRepository.findAndCount({
      where: {
        transportadoraId,
        ...(query.tenantId ? { tenantId: query.tenantId } : {}),
      },
      order: {
        criadoEm: 'DESC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const uploadIds = tables.map((item) => item.uploadId).filter(Boolean) as string[];
    const uploads = uploadIds.length
      ? await this.freightTableUploadsRepository.find({
          where: {
            id: In(uploadIds),
          },
        })
      : [];
    const uploadById = new Map(uploads.map((upload) => [upload.id, upload]));

    return {
      data: tables.map((table) => {
        const upload = table.uploadId ? uploadById.get(table.uploadId) ?? null : null;
        const summary = (upload?.resumoValidacaoJson as Record<string, unknown> | undefined)?.resumo as
          | Record<string, unknown>
          | undefined;

        return {
          id: table.id,
          tenantId: table.tenantId,
          transportadoraId: table.transportadoraId,
          uploadId: table.uploadId,
          nomeTabela: table.nomeTabela,
          tipoTabela: table.tipoTabela,
          ativo: table.ativo,
          criadoEm: table.criadoEm,
          atualizadoEm: table.atualizadoEm,
          nomeArquivoOriginal: upload?.nomeArquivoOriginal ?? null,
          status: upload?.status ?? null,
          resumo: summary ?? null,
        };
      }),
      meta: {
        page,
        limit,
        total,
      },
    };
  }

  async getImportedTable(
    transportadoraId: string,
    tableId: string,
  ): Promise<Record<string, unknown>> {
    const table = await this.findImportedTableById(transportadoraId, tableId);
    const upload = table.uploadId
      ? await this.freightTableUploadsRepository.findOne({ where: { id: table.uploadId } })
      : null;

    const [originsCount, rangesCount, feesCount] = await Promise.all([
      this.freightTableOriginsRepository.count({ where: { freightTableId: table.id } }),
      this.freightTableRangesRepository.count({ where: { freightTableId: table.id } }),
      this.freightTableFeesRepository
        .createQueryBuilder('fee')
        .innerJoin(FreightTableRange, 'range', 'range.id = fee.rangeId')
        .where('range.freightTableId = :freightTableId', { freightTableId: table.id })
        .getCount(),
    ]);

    return {
      ...table,
      upload: upload
        ? {
            id: upload.id,
            nomeArquivoOriginal: upload.nomeArquivoOriginal,
            status: upload.status,
            resumoValidacaoJson: upload.resumoValidacaoJson,
            importadoPor: upload.importadoPor,
            criadoEm: upload.criadoEm,
          }
        : null,
      contadores: {
        origens: originsCount,
        faixas: rangesCount,
        taxas: feesCount,
      },
    };
  }

  async getImportedTablePreview(
    transportadoraId: string,
    tableId: string,
  ): Promise<Record<string, unknown>> {
    const table = await this.findImportedTableById(transportadoraId, tableId);
    const upload = table.uploadId
      ? await this.freightTableUploadsRepository.findOne({ where: { id: table.uploadId } })
      : null;

    const origins = await this.freightTableOriginsRepository.find({
      where: { freightTableId: table.id },
      order: { criadoEm: 'ASC' },
      take: 20,
    });
    const ranges = await this.freightTableRangesRepository.find({
      where: { freightTableId: table.id },
      order: { criadoEm: 'ASC' },
      take: 20,
    });
    const rangeIds = ranges.map((range) => range.id);
    const weightPrices = rangeIds.length
      ? await this.freightTableWeightPricesRepository.find({
          where: rangeIds.map((rangeId) => ({ rangeId })),
          order: { ordem: 'ASC' },
        })
      : [];
    const comparisonPrices = rangeIds.length
      ? await this.freightTableComparisonPricesRepository.find({
          where: rangeIds.map((rangeId) => ({ rangeId })),
        })
      : [];
    const fees = rangeIds.length
      ? await this.freightTableFeesRepository.find({
          where: rangeIds.map((rangeId) => ({ rangeId })),
          take: 50,
        })
      : [];

    return {
      table: {
        id: table.id,
        nomeTabela: table.nomeTabela,
        tipoTabela: table.tipoTabela,
        ativo: table.ativo,
      },
      resumo: upload?.resumoValidacaoJson ?? null,
      preview: {
        origens: origins,
        faixas: ranges.map((range) => ({
          ...range,
          weightPrices: weightPrices.filter((item) => item.rangeId === range.id),
          comparisonPrice:
            comparisonPrices.find((item) => item.rangeId === range.id) ?? null,
          fees: fees.filter((item) => item.rangeId === range.id),
        })),
      },
    };
  }

  async getDownloadInfo(
    transportadoraId: string,
    tableId: string,
  ): Promise<{ nomeArquivoOriginal: string; storagePath: string }> {
    const table = await this.findImportedTableById(transportadoraId, tableId);

    if (!table.uploadId) {
      throw new NotFoundException('Upload original nao encontrado para a tabela.');
    }

    const upload = await this.freightTableUploadsRepository.findOne({
      where: { id: table.uploadId },
    });

    if (!upload) {
      throw new NotFoundException('Arquivo original nao encontrado.');
    }

    return {
      nomeArquivoOriginal: upload.nomeArquivoOriginal,
      storagePath: upload.storagePath,
    };
  }

  async inactivateImportedTable(
    transportadoraId: string,
    tableId: string,
  ): Promise<Record<string, unknown>> {
    const table = await this.findImportedTableById(transportadoraId, tableId);
    table.ativo = false;
    const saved = await this.freightTablesRepository.save(table);

    return {
      id: saved.id,
      ativo: saved.ativo,
      atualizadoEm: saved.atualizadoEm,
    };
  }

  private async ensureTransportadoraWithinTenant(
    transportadoraId: string,
    tenantId?: string,
  ): Promise<void> {
    const transportadora = await this.transportadorasService.findById(transportadoraId);

    if (tenantId && transportadora.tenantId !== tenantId) {
      throw new ConflictException(
        'A transportadora informada nao pertence ao tenant solicitado.',
      );
    }
  }

  private async findImportedTableById(
    transportadoraId: string,
    tableId: string,
  ): Promise<FreightTable> {
    const table = await this.freightTablesRepository.findOne({
      where: {
        id: tableId,
        transportadoraId,
      },
    });

    if (!table) {
      throw new NotFoundException('Tabela de frete importada nao encontrada.');
    }

    return table;
  }

  private buildOriginKey(input: {
    metodoExternoId: string;
    cepOrigemInicial: string;
    cepOrigemFinal: string;
  }): string {
    return `${input.metodoExternoId}|${input.cepOrigemInicial}|${input.cepOrigemFinal}`;
  }

  private buildRangeKey(input: {
    metodoExternoId: string | null;
    cepInicial: string;
    cepFinal: string;
    uf: string | null;
    cidade: string | null;
    rowNumber: number;
  }): string {
    return `${input.metodoExternoId ?? ''}|${input.cepInicial}|${input.cepFinal}|${input.uf ?? ''}|${input.cidade ?? ''}|${input.rowNumber}`;
  }

  private matchOriginForRange(
    model: FreightTableModelType,
    range: {
      metodoExternoId: string | null;
      centroDistribuicaoId: string | null;
      nomeOrigem: string | null;
      cepInicial: string;
      cepFinal: string;
      uf: string | null;
      cidade: string | null;
    },
    origins: Array<{
      metodoExternoId: string;
      cepOrigemInicial: string;
      cepOrigemFinal: string;
      nomeOrigem: string | null;
      centroDistribuicaoId: string | null;
    }>,
    savedOrigins: Map<string, FreightTableOrigin>,
  ): FreightTableOrigin | null {
    if (model !== FreightTableModelType.WEB_FRETES_MULTI_ORIGINS) {
      return null;
    }

    if (origins.length === 1) {
      return savedOrigins.get(this.buildOriginKey(origins[0])) ?? null;
    }

    const matchedOrigin = origins.find((origin) => {
      if (range.metodoExternoId && origin.metodoExternoId === range.metodoExternoId) {
        return true;
      }

      if (
        origin.centroDistribuicaoId &&
        range.centroDistribuicaoId &&
        origin.centroDistribuicaoId === range.centroDistribuicaoId
      ) {
        return true;
      }

      if (origin.nomeOrigem && range.nomeOrigem && origin.nomeOrigem === range.nomeOrigem) {
        return true;
      }

      return false;
    });

    return matchedOrigin
      ? savedOrigins.get(this.buildOriginKey(matchedOrigin)) ?? null
      : null;
  }

  private matchRangeForFee(
    fee: {
      metodoExternoId: string | null;
      centroDistribuicaoId: string | null;
      nomeOrigem: string | null;
      uf: string | null;
      cidade: string | null;
      cepInicial: string | null;
      cepFinal: string | null;
    },
    parsedRanges: Array<{
      metodoExternoId: string | null;
      centroDistribuicaoId: string | null;
      nomeOrigem: string | null;
      uf: string | null;
      cidade: string | null;
      cepInicial: string;
      cepFinal: string;
      rowNumber: number;
    }>,
    savedRanges: Map<string, FreightTableRange>,
  ): FreightTableRange | null {
    if (parsedRanges.length === 1) {
      return savedRanges.get(this.buildRangeKey(parsedRanges[0])) ?? null;
    }

    const matchedRange = parsedRanges.find((range) => {
      const methodMatch =
        fee.metodoExternoId && range.metodoExternoId
          ? fee.metodoExternoId === range.metodoExternoId
          : true;
      const cdMatch =
        fee.centroDistribuicaoId && range.centroDistribuicaoId
          ? fee.centroDistribuicaoId === range.centroDistribuicaoId
          : true;
      const nameMatch =
        fee.nomeOrigem && range.nomeOrigem ? fee.nomeOrigem === range.nomeOrigem : true;
      const ufMatch = fee.uf && range.uf ? fee.uf === range.uf : true;
      const cityMatch =
        fee.cidade && range.cidade ? fee.cidade === range.cidade : true;
      const cepStartMatch =
        fee.cepInicial && range.cepInicial ? fee.cepInicial === range.cepInicial : true;
      const cepEndMatch =
        fee.cepFinal && range.cepFinal ? fee.cepFinal === range.cepFinal : true;

      return methodMatch && cdMatch && nameMatch && ufMatch && cityMatch && cepStartMatch && cepEndMatch;
    });

    return matchedRange ? savedRanges.get(this.buildRangeKey(matchedRange)) ?? null : null;
  }
}
