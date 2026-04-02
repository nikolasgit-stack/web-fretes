import { Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

export abstract class TenantScopedEntity extends BaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  tenantId!: string;
}
