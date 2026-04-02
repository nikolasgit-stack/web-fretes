import { Column, Entity, Index } from 'typeorm';
import { TenantScopedEntity } from '../../common/tenant-scoped.entity';

@Entity({ name: 'produtos' })
@Index(['tenantId', 'sku'], { unique: true })
export class Produto extends TenantScopedEntity {
  @Column({ type: 'varchar', length: 80 })
  sku!: string;

  @Column({ type: 'varchar', length: 180 })
  nome!: string;

  @Column({ type: 'numeric', precision: 12, scale: 4 })
  peso!: number;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  altura!: number;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  largura!: number;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  comprimento!: number;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  valor!: number;

  @Column({ type: 'boolean', default: true, name: 'ativo' })
  ativo!: boolean;
}
