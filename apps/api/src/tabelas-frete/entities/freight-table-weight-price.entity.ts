import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

@Entity({ name: 'freight_table_weight_prices' })
@Index(['rangeId'])
export class FreightTableWeightPrice extends BaseEntity {
  @Column({ type: 'uuid' })
  rangeId!: string;

  @Column({ type: 'numeric', precision: 12, scale: 4 })
  pesoFaixa!: number;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  valor!: number;

  @Column({ type: 'int' })
  ordem!: number;
}
