import { Column, Entity, Index, OneToMany } from 'typeorm';
import { TenantScopedEntity } from '../../common/tenant-scoped.entity';
import { TabelaFrete } from '../../tabelas-frete/entities/tabela-frete.entity';

@Entity({ name: 'centros_distribuicao' })
@Index(['tenantId', 'codigoInterno'], { unique: true })
export class CentroDistribuicao extends TenantScopedEntity {
  @Column({ type: 'varchar', length: 180 })
  nome!: string;

  @Column({ type: 'varchar', length: 80 })
  codigoInterno!: string;

  @Column({ type: 'varchar', length: 120 })
  cidade!: string;

  @Column({ type: 'varchar', length: 2 })
  estado!: string;

  @Column({ type: 'boolean', default: true, name: 'ativo' })
  ativo!: boolean;

  @OneToMany(() => TabelaFrete, (tabelaFrete) => tabelaFrete.centroDistribuicao)
  tabelasFrete!: TabelaFrete[];
}
