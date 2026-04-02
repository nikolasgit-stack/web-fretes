import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { CentroDistribuicao } from '../../centros-distribuicao/entities/centro-distribuicao.entity';
import { TenantScopedEntity } from '../../common/tenant-scoped.entity';
import { Transportadora } from '../../transportadoras/entities/transportadora.entity';

@Entity({ name: 'regras_frete' })
@Index(['tenantId', 'prioridade'])
export class RegraFrete extends TenantScopedEntity {
  @Column({ type: 'varchar', length: 180 })
  nome!: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  marketplace!: string | null;

  @Column({ type: 'uuid', nullable: true })
  transportadoraId!: string | null;

  @Column({ type: 'uuid', nullable: true })
  centroDistribuicaoId!: string | null;

  @Column({ type: 'varchar', length: 2, nullable: true })
  ufDestino!: string | null;

  @Column({ type: 'varchar', length: 8, nullable: true })
  cepInicial!: string | null;

  @Column({ type: 'varchar', length: 8, nullable: true })
  cepFinal!: string | null;

  @Column({ type: 'numeric', precision: 12, scale: 4, nullable: true })
  pesoMin!: number | null;

  @Column({ type: 'numeric', precision: 12, scale: 4, nullable: true })
  pesoMax!: number | null;

  @Column({ type: 'boolean', default: true, name: 'ativo' })
  ativo!: boolean;

  @Column({ type: 'int', default: 0 })
  prioridade!: number;

  @Column({ type: 'text', nullable: true })
  observacao!: string | null;

  @ManyToOne(() => Transportadora, (transportadora) => transportadora.regrasFrete, {
    nullable: true,
  })
  @JoinColumn({ name: 'transportadoraId' })
  transportadora!: Transportadora | null;

  @ManyToOne(
    () => CentroDistribuicao,
    (centroDistribuicao) => centroDistribuicao.regrasFrete,
    { nullable: true },
  )
  @JoinColumn({ name: 'centroDistribuicaoId' })
  centroDistribuicao!: CentroDistribuicao | null;
}
