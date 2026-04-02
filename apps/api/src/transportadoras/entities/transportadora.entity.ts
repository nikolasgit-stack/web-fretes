import { Column, Entity, Index, OneToMany } from 'typeorm';
import { RegraFrete } from '../../regras-frete/entities/regra-frete.entity';
import { TenantScopedEntity } from '../../common/tenant-scoped.entity';
import { TabelaFrete } from '../../tabelas-frete/entities/tabela-frete.entity';

export enum TipoIntegracaoTransportadora {
  MANUAL = 'manual',
  API = 'api',
  HUB = 'hub',
}

@Entity({ name: 'transportadoras' })
@Index(['tenantId', 'codigoInterno'], { unique: true })
export class Transportadora extends TenantScopedEntity {
  @Column({ type: 'varchar', length: 180 })
  nome!: string;

  @Column({ type: 'varchar', length: 80 })
  codigoInterno!: string;

  @Column({ type: 'varchar', length: 80, nullable: true })
  modalidade!: string | null;

  @Column({
    type: 'enum',
    enum: TipoIntegracaoTransportadora,
    default: TipoIntegracaoTransportadora.MANUAL,
  })
  tipoIntegracao!: TipoIntegracaoTransportadora;

  @Column({ type: 'varchar', length: 180, nullable: true })
  contato!: string | null;

  @Column({ type: 'text', nullable: true })
  observacao!: string | null;

  @Column({ type: 'boolean', default: true, name: 'ativo' })
  ativo!: boolean;

  @Column({ type: 'int', default: 0 })
  prazoCd!: number;

  @Column({ type: 'numeric', precision: 12, scale: 4, default: 0 })
  cubagem!: number;

  @Column({ type: 'boolean', default: false })
  isencaoCubagem!: boolean;

  @Column({ type: 'boolean', default: false })
  icmsIncluso!: boolean;

  @Column({ type: 'varchar', length: 2 })
  estadoOrigem!: string;

  @Column({ type: 'boolean', default: false })
  linhaBranca!: boolean;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  limiteAltura!: number | null;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  limiteLargura!: number | null;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  limiteComprimento!: number | null;

  @OneToMany(() => TabelaFrete, (tabelaFrete) => tabelaFrete.transportadora)
  tabelasFrete!: TabelaFrete[];

  @OneToMany(() => RegraFrete, (regraFrete) => regraFrete.transportadora)
  regrasFrete!: RegraFrete[];
}
