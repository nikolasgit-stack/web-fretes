import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { FreightTableTariffMode } from './freight-table.enums';

@Entity({ name: 'freight_table_ranges' })
@Index(['freightTableId'])
@Index(['originId'])
export class FreightTableRange extends BaseEntity {
  @Column({ type: 'uuid' })
  freightTableId!: string;

  @Column({ type: 'uuid', nullable: true })
  originId!: string | null;

  @Column({ type: 'varchar', length: 2, nullable: true })
  uf!: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  cidade!: string | null;

  @Column({ type: 'varchar', length: 8 })
  cepInicial!: string;

  @Column({ type: 'varchar', length: 8 })
  cepFinal!: string;

  @Column({ type: 'int' })
  prazo!: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  valorMinimoFrete!: number | null;

  @Column({
    type: 'enum',
    enum: FreightTableTariffMode,
  })
  modoTarifa!: FreightTableTariffMode;
}
