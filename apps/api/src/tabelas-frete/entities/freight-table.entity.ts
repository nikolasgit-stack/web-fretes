import { Column, Entity, Index } from 'typeorm';
import { TenantScopedEntity } from '../../common/tenant-scoped.entity';
import { FreightTableModelType } from './freight-table.enums';

@Entity({ name: 'freight_tables' })
@Index(['tenantId', 'transportadoraId', 'tipoTabela', 'ativo'])
export class FreightTable extends TenantScopedEntity {
  @Column({ type: 'uuid' })
  transportadoraId!: string;

  @Column({ type: 'uuid', nullable: true })
  uploadId!: string | null;

  @Column({
    type: 'enum',
    enum: FreightTableModelType,
  })
  tipoTabela!: FreightTableModelType;

  @Column({ type: 'varchar', length: 180 })
  nomeTabela!: string;

  @Column({ type: 'numeric', precision: 12, scale: 4 })
  icmsCalculado!: number;

  @Column({ type: 'numeric', precision: 12, scale: 4, nullable: true })
  cubagem!: number | null;

  @Column({ type: 'boolean', default: false })
  isencaoCubagem!: boolean;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  limiteAltura!: number | null;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  limiteLargura!: number | null;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  limiteComprimento!: number | null;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  limiteSomaDimensoes!: number | null;

  @Column({ type: 'boolean', default: true })
  ativo!: boolean;
}
