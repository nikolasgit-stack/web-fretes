import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'tenants' })
export class Tenant extends BaseEntity {
  @Column({ type: 'varchar', length: 180 })
  nome!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 120 })
  slug!: string;

  @Column({ type: 'boolean', default: true, name: 'ativo' })
  ativo!: boolean;

  @OneToMany(() => User, (user) => user.tenant)
  users!: User[];
}
