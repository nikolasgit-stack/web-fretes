import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

@Entity({ name: 'freight_table_comparison_prices' })
@Index(['rangeId'], { unique: true })
export class FreightTableComparisonPrice extends BaseEntity {
  @Column({ type: 'uuid' })
  rangeId!: string;

  @Column({ type: 'numeric', precision: 14, scale: 4, nullable: true })
  valorPorKg!: number | null;

  @Column({ type: 'numeric', precision: 10, scale: 4, nullable: true })
  percentualSobreNF!: number | null;

  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  freteMinimo!: number | null;
}
