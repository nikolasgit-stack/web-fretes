import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

@Entity({ name: 'freight_table_origins' })
@Index(['freightTableId'])
export class FreightTableOrigin extends BaseEntity {
  @Column({ type: 'uuid' })
  freightTableId!: string;

  @Column({ type: 'varchar', length: 8 })
  cepOrigemInicial!: string;

  @Column({ type: 'varchar', length: 8 })
  cepOrigemFinal!: string;

  @Column({ type: 'varchar', length: 120 })
  metodoExternoId!: string;

  @Column({ type: 'uuid', nullable: true })
  centroDistribuicaoId!: string | null;

  @Column({ type: 'varchar', length: 180, nullable: true })
  nomeOrigem!: string | null;
}
