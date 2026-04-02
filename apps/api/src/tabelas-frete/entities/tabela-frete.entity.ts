import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { TenantScopedEntity } from '../../common/tenant-scoped.entity';
import { CentroDistribuicao } from '../../centros-distribuicao/entities/centro-distribuicao.entity';
import { Transportadora } from '../../transportadoras/entities/transportadora.entity';

export enum TipoTabelaFrete {
  PADRAO = 'padrao',
  PROMOCIONAL = 'promocional',
  NEGOCIADA = 'negociada',
}

@Entity({ name: 'tabelas_frete' })
@Index(['tenantId', 'transportadoraId', 'centroDistribuicaoId', 'tipoTabela'])
export class TabelaFrete extends TenantScopedEntity {
  @Column({ type: 'uuid' })
  transportadoraId!: string;

  @Column({ type: 'uuid' })
  centroDistribuicaoId!: string;

  @Column({ type: 'date' })
  vigenciaInicio!: string;

  @Column({ type: 'date', nullable: true })
  vigenciaFim!: string | null;

  @Column({ type: 'boolean', default: true })
  ativa!: boolean;

  @Column({
    type: 'enum',
    enum: TipoTabelaFrete,
    default: TipoTabelaFrete.PADRAO,
  })
  tipoTabela!: TipoTabelaFrete;

  @ManyToOne(() => Transportadora, (transportadora) => transportadora.tabelasFrete, {
    nullable: false,
  })
  @JoinColumn({ name: 'transportadoraId' })
  transportadora!: Transportadora;

  @ManyToOne(
    () => CentroDistribuicao,
    (centroDistribuicao) => centroDistribuicao.tabelasFrete,
    { nullable: false },
  )
  @JoinColumn({ name: 'centroDistribuicaoId' })
  centroDistribuicao!: CentroDistribuicao;
}
