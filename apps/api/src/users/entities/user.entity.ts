import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { TenantScopedEntity } from '../../common/tenant-scoped.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';

@Entity({ name: 'users' })
@Index(['tenantId', 'email'], { unique: true })
export class User extends TenantScopedEntity {
  @Column({ type: 'varchar', length: 180 })
  nome!: string;

  @Column({ type: 'varchar', length: 180 })
  email!: string;

  @Column({ type: 'varchar', length: 255, name: 'senha', select: false })
  senha!: string;

  @Column({ type: 'boolean', default: true, name: 'ativo' })
  ativo!: boolean;

  @ManyToOne(() => Tenant, (tenant) => tenant.users, { nullable: false })
  @JoinColumn({ name: 'tenantId' })
  tenant!: Tenant;
}
