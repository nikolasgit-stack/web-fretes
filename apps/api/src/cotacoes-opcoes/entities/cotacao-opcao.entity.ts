import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { Cotacao } from '../../cotacoes/entities/cotacao.entity';
import { Transportadora } from '../../transportadoras/entities/transportadora.entity';

@Entity({ name: 'cotacoes_opcoes' })
export class CotacaoOpcao extends BaseEntity {
  @Column({ type: 'uuid' })
  cotacaoId!: string;

  @Column({ type: 'uuid' })
  transportadoraId!: string;

  @Column({ type: 'varchar', length: 80 })
  metodoEnvio!: string;

  @Column({ type: 'int' })
  prazo!: number;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  tarifa!: number;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  tarifaExibida!: number;

  @Column({ type: 'boolean', default: true })
  ativa!: boolean;

  @Column({ type: 'boolean', default: false })
  semCobertura!: boolean;

  @Column({ type: 'boolean', default: false })
  retiradaCotacao!: boolean;

  @Column({ type: 'varchar', length: 180, nullable: true })
  regra!: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  detalheJson!: Record<string, unknown>;

  @ManyToOne(() => Cotacao, (cotacao) => cotacao.opcoes, { nullable: false })
  @JoinColumn({ name: 'cotacaoId' })
  cotacao!: Cotacao;

  @ManyToOne(() => Transportadora, { nullable: false })
  @JoinColumn({ name: 'transportadoraId' })
  transportadora!: Transportadora;
}
