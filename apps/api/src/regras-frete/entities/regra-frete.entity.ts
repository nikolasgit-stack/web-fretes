import { Column, Entity, Index } from 'typeorm';
import { TenantScopedEntity } from '../../common/tenant-scoped.entity';

@Entity({ name: 'regras_frete' })
@Index(['tenantId', 'prioridade'])
export class RegraFrete extends TenantScopedEntity {
  @Column({ type: 'varchar', length: 180 })
  nome!: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  marketplace!: string | null;

  @Column({ type: 'varchar', length: 2, nullable: true })
  ufDestino!: string | null;

  @Column({ type: 'numeric', precision: 12, scale: 4, nullable: true })
  pesoMin!: number | null;

  @Column({ type: 'numeric', precision: 12, scale: 4, nullable: true })
  pesoMax!: number | null;

  @Column({ type: 'boolean', default: true, name: 'ativo' })
  ativo!: boolean;

  @Column({ type: 'int', default: 0 })
  prioridade!: number;
}
