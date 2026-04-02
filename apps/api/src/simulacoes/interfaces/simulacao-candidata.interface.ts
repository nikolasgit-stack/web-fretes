export interface SimulacaoCandidata {
  transportadoraId: string;
  transportadoraNome: string;
  metodoEnvio: string;
  prazo: number;
  tarifa: number;
  tarifaExibida: number;
  ativa: boolean;
  semCobertura: boolean;
  retiradaCotacao: boolean;
  regra: string | null;
  prioridadeRegra: number | null;
  motivoDescarte: string | null;
  detalheJson: Record<string, unknown>;
}
