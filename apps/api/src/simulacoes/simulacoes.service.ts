import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { CotacoesOpcoesService } from '../cotacoes-opcoes/cotacoes-opcoes.service';
import { CotacoesService } from '../cotacoes/cotacoes.service';
import {
  Cotacao,
  CotacaoStatus,
} from '../cotacoes/entities/cotacao.entity';
import {
  SimulacaoDetalhamentoDto,
  SimulacaoOpcaoDto,
  SimulacaoResumoDto,
  SimularCotacaoResponseDto,
} from '../cotacoes/dto/simular-cotacao-response.dto';
import {
  SimularCotacaoDto,
  SimularCotacaoItemDto,
} from '../cotacoes/dto/simular-cotacao.dto';
import { RegrasFreteService } from '../regras-frete/regras-frete.service';
import { TabelasFreteService } from '../tabelas-frete/tabelas-frete.service';
import { TenantsService } from '../tenants/tenants.service';
import { SimulacaoCandidata } from './interfaces/simulacao-candidata.interface';
import { DecisionEngineService } from './decision-engine.service';

@Injectable()
export class SimulacoesService {
  constructor(
    private readonly tenantsService: TenantsService,
    private readonly tabelasFreteService: TabelasFreteService,
    private readonly regrasFreteService: RegrasFreteService,
    @Inject(forwardRef(() => CotacoesService))
    private readonly cotacoesService: CotacoesService,
    private readonly cotacoesOpcoesService: CotacoesOpcoesService,
    private readonly decisionEngineService: DecisionEngineService,
  ) {}

  async simular(
    simularCotacaoDto: SimularCotacaoDto,
  ): Promise<SimularCotacaoResponseDto> {
    await this.tenantsService.findById(simularCotacaoDto.tenantId);

    const totais = this.calcularTotais(simularCotacaoDto.itens);
    const tabelas = (await this.tabelasFreteService.findAll()).filter(
      (tabela) => tabela.tenantId === simularCotacaoDto.tenantId && tabela.ativa,
    );
    const regras = (await this.regrasFreteService.findAll({})).filter(
      (regra) => regra.tenantId === simularCotacaoDto.tenantId && regra.ativo,
    );

    const simulacao = this.gerarOpcoes(
      simularCotacaoDto,
      totais,
      tabelas,
      regras,
    );
    const opcoesGeradas = this.decisionEngineService.ordenarOpcoes(
      simulacao.opcoes,
    );
    const melhorOpcao = this.decisionEngineService.escolherMelhorOpcao(
      opcoesGeradas,
    );

    const cotacao = await this.persistirCotacao(
      simularCotacaoDto,
      totais,
      opcoesGeradas,
      melhorOpcao,
    );

    const detalhamento: SimulacaoDetalhamentoDto = {
      valorProdutos: totais.valorProdutos,
      pesoTotal: totais.pesoTotal,
      volumeTotal: totais.volumeTotal,
      transportadorasConsideradas: new Set(
        opcoesGeradas.map((opcao) => opcao.transportadoraId),
      ).size,
      tabelasConsideradas: tabelas.length,
      tabelasDescartadas: simulacao.tabelasDescartadas,
      regrasAvaliadas: regras.length,
      regrasAplicadas: opcoesGeradas
        .map((opcao) => opcao.regra)
        .filter((regra): regra is string => Boolean(regra)),
      criterioEscolha: this.decisionEngineService.getCriterioEscolha(),
      fallbackAcionado: melhorOpcao === null,
      motivoFallback: this.definirMotivoFallback({
        tabelasConsideradas: tabelas.length,
        opcoesGeradas,
      }),
    };

    const opcoes = await this.cotacoesOpcoesService.findByCotacaoId(cotacao.id);

    const melhorOpcaoPersistida =
      melhorOpcao !== null
        ? opcoes.find((opcao) => opcao.id === cotacao.melhorOpcaoId) ?? null
        : null;

    const resumo = this.montarResumo(
      opcoes,
      melhorOpcaoPersistida !== null,
      detalhamento.motivoFallback,
    );

    return {
      cotacaoId: cotacao.id,
      status: cotacao.status,
      melhorOpcao:
        melhorOpcaoPersistida !== null
          ? this.mapearOpcaoResposta(melhorOpcaoPersistida)
          : null,
      opcoes: opcoes.map((opcao) => this.mapearOpcaoResposta(opcao)),
      detalhamento,
      resumo,
    };
  }

  private calcularTotais(itens: SimularCotacaoItemDto[]): {
    valorProdutos: number;
    pesoTotal: number;
    volumeTotal: number;
    cubagemTotal: number;
  } {
    return itens.reduce(
      (accumulator, item) => {
        const volumeUnitario = item.altura * item.largura * item.comprimento;
        const quantidade = item.quantidade;

        return {
          valorProdutos: accumulator.valorProdutos + item.valor * quantidade,
          pesoTotal: accumulator.pesoTotal + item.peso * quantidade,
          volumeTotal: accumulator.volumeTotal + quantidade,
          cubagemTotal:
            accumulator.cubagemTotal + (volumeUnitario * quantidade) / 1000000,
        };
      },
      {
        valorProdutos: 0,
        pesoTotal: 0,
        volumeTotal: 0,
        cubagemTotal: 0,
      },
    );
  }

  private gerarOpcoes(
    input: SimularCotacaoDto,
    totais: {
      valorProdutos: number;
      pesoTotal: number;
      volumeTotal: number;
      cubagemTotal: number;
    },
    tabelas: Array<{
      transportadoraId: string;
      centroDistribuicaoId: string;
      tipoTabela: string;
      transportadora: {
        id: string;
        nome: string;
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
      };
      centroDistribuicao: {
        cidade: string;
        estado: string;
      };
    }>,
    regras: Array<{
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
    }>,
  ): {
    opcoes: SimulacaoCandidata[];
    tabelasDescartadas: number;
  } {
    const ufDestino = this.resolverUfDestino(input.cepDestino);
    let tabelasDescartadas = 0;

    const opcoes = tabelas.map((tabela) => {
      const transportadora = tabela.transportadora;
      const regraAplicada =
        [...regras]
          .sort((a, b) => a.prioridade - b.prioridade)
          .find((regra) => {
            const marketplaceOk =
              !regra.marketplace || regra.marketplace === input.marketplace;
            const transportadoraOk =
              !regra.transportadoraId ||
              regra.transportadoraId === transportadora.id;
            const centroDistribuicaoOk =
              !regra.centroDistribuicaoId ||
              regra.centroDistribuicaoId === tabela.centroDistribuicaoId;
            const ufOk =
              !regra.ufDestino ||
              (ufDestino !== null && regra.ufDestino === ufDestino);
            const cepInicialOk =
              !regra.cepInicial || input.cepDestino >= regra.cepInicial;
            const cepFinalOk =
              !regra.cepFinal || input.cepDestino <= regra.cepFinal;
            const pesoMinOk =
              regra.pesoMin === null || totais.pesoTotal >= regra.pesoMin;
            const pesoMaxOk =
              regra.pesoMax === null || totais.pesoTotal <= regra.pesoMax;

            return (
              marketplaceOk &&
              transportadoraOk &&
              centroDistribuicaoOk &&
              ufOk &&
              cepInicialOk &&
              cepFinalOk &&
              pesoMinOk &&
              pesoMaxOk
            );
          }) ?? null;

      const semCobertura = !this.temCoberturaBasica(input.cepDestino);
      const excedeLimites = this.excedeLimites(input.itens, transportadora);
      const linhaBrancaInvalida =
        transportadora.linhaBranca && !this.temItemLinhaBranca(input.itens);
      const transportadoraInativa = !transportadora.ativo;
      const retiradaCotacao =
        transportadoraInativa || excedeLimites || linhaBrancaInvalida;

      const pesoConsiderado = transportadora.isencaoCubagem
        ? totais.pesoTotal
        : Math.max(totais.pesoTotal, totais.cubagemTotal * transportadora.cubagem);

      const tarifaBase = pesoConsiderado * 2.75 + totais.valorProdutos * 0.015;
      const icms = transportadora.icmsIncluso ? 0 : tarifaBase * 0.12;
      const adicionalMarketplace = input.marketplace ? 4.9 : 0;
      const tarifa = Number((tarifaBase + icms + adicionalMarketplace).toFixed(2));
      const tarifaExibida = Number(
        (regraAplicada ? tarifa * 0.97 : tarifa).toFixed(2),
      );
      const prazo = transportadora.prazoCd + (semCobertura ? 5 : 2);
      const ativa = !semCobertura && !retiradaCotacao;
      const motivoDescarte = this.definirMotivoDescarte({
        semCobertura,
        transportadoraInativa,
        excedeLimites,
        linhaBrancaInvalida,
      });

      if (!ativa) {
        tabelasDescartadas += 1;
      }

      return {
        transportadoraId: transportadora.id,
        transportadoraNome: transportadora.nome,
        metodoEnvio: `${tabela.tipoTabela}_${transportadora.estadoOrigem}_${ufDestino ?? 'BR'}`,
        prazo,
        tarifa,
        tarifaExibida,
        ativa,
        semCobertura,
        retiradaCotacao,
        regra: regraAplicada?.nome ?? null,
        prioridadeRegra: regraAplicada?.prioridade ?? null,
        motivoDescarte,
        detalheJson: {
          centroDistribuicao: tabela.centroDistribuicao,
          tipoTabela: tabela.tipoTabela,
          pesoReal: totais.pesoTotal,
          cubagemTotal: Number(totais.cubagemTotal.toFixed(4)),
          pesoConsiderado: Number(pesoConsiderado.toFixed(4)),
          regraAplicada: regraAplicada?.nome ?? null,
          prioridadeRegra: regraAplicada?.prioridade ?? null,
          marketplace: input.marketplace ?? null,
          ufDestino,
          motivoDescarte,
        },
      };
    });

    return {
      opcoes,
      tabelasDescartadas,
    };
  }

  private resolverUfDestino(_cepDestino: string): string | null {
    return null;
  }

  private temCoberturaBasica(cepDestino: string): boolean {
    return /^\d{8}$/.test(cepDestino) && !cepDestino.startsWith('000');
  }

  private definirMotivoDescarte(input: {
    semCobertura: boolean;
    transportadoraInativa: boolean;
    excedeLimites: boolean;
    linhaBrancaInvalida: boolean;
  }): string | null {
    if (input.semCobertura) {
      return 'sem_cobertura';
    }

    if (input.transportadoraInativa) {
      return 'transportadora_inativa';
    }

    if (input.excedeLimites) {
      return 'excede_limites_dimensao';
    }

    if (input.linhaBrancaInvalida) {
      return 'linha_branca_incompativel';
    }

    return null;
  }

  private definirMotivoFallback(input: {
    tabelasConsideradas: number;
    opcoesGeradas: SimulacaoCandidata[];
  }): string | null {
    if (input.tabelasConsideradas === 0) {
      return 'nenhuma_tabela_valida';
    }

    if (input.opcoesGeradas.length === 0) {
      return 'nenhuma_opcao_gerada';
    }

    const possuiRegraValida = input.opcoesGeradas.some((opcao) => opcao.regra !== null);

    if (!possuiRegraValida) {
      return 'nenhuma_regra_valida';
    }

    if (input.opcoesGeradas.every((opcao) => opcao.semCobertura)) {
      return 'nenhuma_cobertura_disponivel';
    }

    if (input.opcoesGeradas.every((opcao) => !opcao.ativa)) {
      return 'todas_opcoes_invalidas';
    }

    return null;
  }

  private excedeLimites(
    itens: SimularCotacaoItemDto[],
    transportadora: {
      limiteAltura: number | null;
      limiteLargura: number | null;
      limiteComprimento: number | null;
    },
  ): boolean {
    return itens.some(
      (item) =>
        (transportadora.limiteAltura !== null &&
          item.altura > transportadora.limiteAltura) ||
        (transportadora.limiteLargura !== null &&
          item.largura > transportadora.limiteLargura) ||
        (transportadora.limiteComprimento !== null &&
          item.comprimento > transportadora.limiteComprimento),
    );
  }

  private temItemLinhaBranca(itens: SimularCotacaoItemDto[]): boolean {
    return itens.some(
      (item) =>
        item.altura >= 60 || item.largura >= 60 || item.comprimento >= 60,
    );
  }

  private async persistirCotacao(
    input: SimularCotacaoDto,
    totais: {
      valorProdutos: number;
      pesoTotal: number;
      volumeTotal: number;
    },
    opcoes: SimulacaoCandidata[],
    melhorOpcao: SimulacaoCandidata | null,
  ): Promise<Cotacao> {
    const cotacao = this.cotacoesService.create({
      tenantId: input.tenantId,
      cepDestino: input.cepDestino,
      valorProdutos: totais.valorProdutos,
      pesoTotal: totais.pesoTotal,
      volumeTotal: totais.volumeTotal,
      marketplace: input.marketplace ?? null,
      status: melhorOpcao ? CotacaoStatus.CONCLUIDA : CotacaoStatus.SEM_OPCOES,
      melhorOpcaoId: null,
    });

    const savedCotacao = await this.cotacoesService.save(cotacao);
    const opcoesCriadas = this.cotacoesOpcoesService.createMany(
      opcoes.map((opcao) => ({
        cotacaoId: savedCotacao.id,
        transportadoraId: opcao.transportadoraId,
        metodoEnvio: opcao.metodoEnvio,
        prazo: opcao.prazo,
        tarifa: opcao.tarifa,
        tarifaExibida: opcao.tarifaExibida,
        ativa: opcao.ativa,
        semCobertura: opcao.semCobertura,
        retiradaCotacao: opcao.retiradaCotacao,
        regra: opcao.regra,
        detalheJson: opcao.detalheJson,
      })),
    );
    const savedOpcoes = await this.cotacoesOpcoesService.saveMany(opcoesCriadas);

    if (melhorOpcao) {
      const melhorOpcaoPersistida = savedOpcoes.find(
        (opcao) =>
          opcao.transportadoraId === melhorOpcao.transportadoraId &&
          opcao.metodoEnvio === melhorOpcao.metodoEnvio &&
          Number(opcao.tarifaExibida) === melhorOpcao.tarifaExibida,
      );

      savedCotacao.melhorOpcaoId = melhorOpcaoPersistida?.id ?? null;
      savedCotacao.status = CotacaoStatus.CONCLUIDA;
      return this.cotacoesService.save(savedCotacao);
    }

    return savedCotacao;
  }

  private mapearOpcaoResposta(opcao: {
    id: string;
    transportadoraId: string;
    metodoEnvio: string;
    prazo: number;
    tarifa: number;
    tarifaExibida: number;
    ativa: boolean;
    semCobertura: boolean;
    retiradaCotacao: boolean;
    regra: string | null;
    prioridadeRegra?: number | null;
    motivoDescarte?: string | null;
    detalheJson: Record<string, unknown>;
    transportadora?: { nome: string };
  }): SimulacaoOpcaoDto {
    return {
      id: opcao.id,
      transportadoraId: opcao.transportadoraId,
      transportadoraNome: opcao.transportadora?.nome ?? '',
      metodoEnvio: opcao.metodoEnvio,
      prazo: opcao.prazo,
      tarifa: Number(opcao.tarifa),
      tarifaExibida: Number(opcao.tarifaExibida),
      ativa: opcao.ativa,
      semCobertura: opcao.semCobertura,
      retiradaCotacao: opcao.retiradaCotacao,
      regra: opcao.regra,
      prioridadeRegra: opcao.prioridadeRegra ?? null,
      motivoDescarte: opcao.motivoDescarte ?? null,
      detalheJson: opcao.detalheJson,
    };
  }

  private montarResumo(
    opcoes: Array<{ ativa: boolean; transportadora?: { nome: string }; prazo: number; tarifaExibida: number }>,
    possuiMelhorOpcao: boolean,
    motivoFallback: string | null,
  ): SimulacaoResumoDto {
    if (!possuiMelhorOpcao) {
      return {
        titulo: 'Nenhuma opcao elegivel encontrada',
        descricao: motivoFallback
          ? `A simulacao terminou sem melhor opcao. Motivo principal: ${motivoFallback}.`
          : 'A simulacao terminou sem melhor opcao.',
        quantidadeOpcoes: opcoes.length,
        possuiMelhorOpcao: false,
      };
    }

    const melhor = opcoes[0];

    return {
      titulo: 'Melhor opcao encontrada',
      descricao: `${melhor.transportadora?.nome ?? 'Transportadora'} com prazo de ${melhor.prazo} dia(s) e tarifa exibida de ${Number(melhor.tarifaExibida).toFixed(2)}.`,
      quantidadeOpcoes: opcoes.length,
      possuiMelhorOpcao: true,
    };
  }
}
