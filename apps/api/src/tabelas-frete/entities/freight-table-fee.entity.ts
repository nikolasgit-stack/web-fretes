import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

@Entity({ name: 'freight_table_fees' })
@Index(['rangeId'])
export class FreightTableFee extends BaseEntity {
  @Column({ type: 'uuid' })
  rangeId!: string;

  @Column({ type: 'varchar', length: 120 })
  tipoTaxa!: string;

  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  minimo!: number | null;

  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  maximo!: number | null;

  @Column({ type: 'numeric', precision: 10, scale: 4, nullable: true })
  percentual!: number | null;

  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  valorFixo!: number | null;

  @Column({ type: 'numeric', precision: 12, scale: 4, nullable: true })
  faixaPesoKg!: number | null;

  @Column({ type: 'numeric', precision: 12, scale: 4, nullable: true })
  variacaoInicial!: number | null;

  @Column({ type: 'numeric', precision: 12, scale: 4, nullable: true })
  variacaoFinal!: number | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  baseVariacao!: string | null;

  @Column({ type: 'numeric', precision: 14, scale: 4, nullable: true })
  valorVariacao!: number | null;

  @Column({ type: 'boolean', nullable: true })
  somaComPrimeiroValor!: boolean | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  modoCobrancaVariacao!: string | null;
}
