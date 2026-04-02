import { Column, Entity, Index, OneToMany } from 'typeorm';
import { RegraFrete } from '../../regras-frete/entities/regra-frete.entity';
import { TenantScopedEntity } from '../../common/tenant-scoped.entity';
import { TabelaFrete } from '../../tabelas-frete/entities/tabela-frete.entity';

@Entity({ name: 'centros_distribuicao' })
@Index(['tenantId', 'codigoInterno'], { unique: true })
export class CentroDistribuicao extends TenantScopedEntity {
  @Column({ type: 'varchar', length: 180 })
  nome!: string;

  @Column({ type: 'varchar', length: 80 })
  codigoInterno!: string;

  @Column({ type: 'varchar', length: 8, nullable: true })
  cep!: string | null;

  @Column({ type: 'varchar', length: 120 })
  cidade!: string;

  @Column({ type: 'varchar', length: 2 })
  estado!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  endereco!: string | null;

  @Column({ type: 'boolean', default: true, name: 'ativo' })
  ativo!: boolean;

  @OneToMany(() => TabelaFrete, (tabelaFrete) => tabelaFrete.centroDistribuicao)
  tabelasFrete!: TabelaFrete[];

  @OneToMany(() => RegraFrete, (regraFrete) => regraFrete.centroDistribuicao)
  regrasFrete!: RegraFrete[];
}
