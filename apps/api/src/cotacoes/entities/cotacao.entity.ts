import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { TenantScopedEntity } from '../../common/tenant-scoped.entity';
import { CotacaoOpcao } from '../../cotacoes-opcoes/entities/cotacao-opcao.entity';

export enum CotacaoStatus {
  PROCESSANDO = 'processando',
  CONCLUIDA = 'concluida',
  SEM_OPCOES = 'sem_opcoes',
}

@Entity({ name: 'cotacoes' })
@Index(['tenantId', 'criadoEm'])
export class Cotacao extends TenantScopedEntity {
  @Column({ type: 'varchar', length: 8 })
  cepDestino!: string;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  valorProdutos!: number;

  @Column({ type: 'numeric', precision: 12, scale: 4 })
  pesoTotal!: number;

  @Column({ type: 'int' })
  volumeTotal!: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  marketplace!: string | null;

  @Column({
    type: 'enum',
    enum: CotacaoStatus,
    default: CotacaoStatus.PROCESSANDO,
  })
  status!: CotacaoStatus;

  @Column({ type: 'uuid', nullable: true })
  melhorOpcaoId!: string | null;

  @OneToMany(() => CotacaoOpcao, (cotacaoOpcao) => cotacaoOpcao.cotacao, {
    cascade: false,
  })
  opcoes!: CotacaoOpcao[];

  @ManyToOne(() => CotacaoOpcao, { nullable: true })
  @JoinColumn({ name: 'melhorOpcaoId' })
  melhorOpcao!: CotacaoOpcao | null;
}
