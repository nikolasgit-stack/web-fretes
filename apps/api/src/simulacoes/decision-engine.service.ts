import { Injectable } from '@nestjs/common';
import { SimulacaoCandidata } from './interfaces/simulacao-candidata.interface';

@Injectable()
export class DecisionEngineService {
  private static readonly CRITERIO_ESCOLHA =
    'prioridade_regra_asc > tarifa_exibida_asc > prazo_asc';

  getCriterioEscolha(): string {
    return DecisionEngineService.CRITERIO_ESCOLHA;
  }

  ordenarOpcoes(opcoes: SimulacaoCandidata[]): SimulacaoCandidata[] {
    return [...opcoes].sort((a, b) => {
      const aElegivel = a.ativa && !a.semCobertura && !a.retiradaCotacao;
      const bElegivel = b.ativa && !b.semCobertura && !b.retiradaCotacao;

      if (aElegivel !== bElegivel) {
        return aElegivel ? -1 : 1;
      }

      const aPrioridade = a.prioridadeRegra ?? Number.MAX_SAFE_INTEGER;
      const bPrioridade = b.prioridadeRegra ?? Number.MAX_SAFE_INTEGER;

      if (aPrioridade !== bPrioridade) {
        return aPrioridade - bPrioridade;
      }

      if (a.tarifaExibida !== b.tarifaExibida) {
        return a.tarifaExibida - b.tarifaExibida;
      }

      return a.prazo - b.prazo;
    });
  }

  escolherMelhorOpcao(
    opcoes: SimulacaoCandidata[],
  ): SimulacaoCandidata | null {
    const elegiveis = this.ordenarOpcoes(opcoes).filter(
      (opcao) =>
        opcao.ativa && !opcao.semCobertura && !opcao.retiradaCotacao,
    );

    if (elegiveis.length === 0) {
      return null;
    }

    return elegiveis[0];
  }
}
