import { Column, Entity, Index } from 'typeorm';
import { TenantScopedEntity } from '../../common/tenant-scoped.entity';
import {
  FreightTableModelType,
  FreightTableUploadStatus,
} from './freight-table.enums';

@Entity({ name: 'freight_table_uploads' })
@Index(['tenantId', 'transportadoraId', 'criadoEm'])
export class FreightTableUpload extends TenantScopedEntity {
  @Column({ type: 'uuid' })
  transportadoraId!: string;

  @Column({
    type: 'enum',
    enum: FreightTableModelType,
  })
  tipoTabela!: FreightTableModelType;

  @Column({ type: 'varchar', length: 255 })
  nomeArquivoOriginal!: string;

  @Column({ type: 'varchar', length: 500 })
  storagePath!: string;

  @Column({
    type: 'enum',
    enum: FreightTableUploadStatus,
    default: FreightTableUploadStatus.RECEIVED,
  })
  status!: FreightTableUploadStatus;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  resumoValidacaoJson!: Record<string, unknown>;

  @Column({ type: 'varchar', length: 180, nullable: true })
  importadoPor!: string | null;
}
