import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CentroDistribuicao } from '../centros-distribuicao/entities/centro-distribuicao.entity';
import { TenantsService } from '../tenants/tenants.service';
import { Transportadora } from '../transportadoras/entities/transportadora.entity';
import { CreateRegraFreteDto } from './dto/create-regra-frete.dto';
import { ListRegrasFreteDto } from './dto/list-regras-frete.dto';
import { UpdateRegraFreteDto } from './dto/update-regra-frete.dto';
import { RegraFrete } from './entities/regra-frete.entity';

@Injectable()
export class RegrasFreteService {
  constructor(
    @InjectRepository(RegraFrete)
    private readonly regrasFreteRepository: Repository<RegraFrete>,
    @InjectRepository(Transportadora)
    private readonly transportadorasRepository: Repository<Transportadora>,
    @InjectRepository(CentroDistribuicao)
    private readonly centrosRepository: Repository<CentroDistribuicao>,
    private readonly tenantsService: TenantsService,
  ) {}

  async findAll(query: ListRegrasFreteDto): Promise<RegraFrete[]> {
    const queryBuilder = this.regrasFreteRepository
      .createQueryBuilder('regra')
      .leftJoinAndSelect('regra.transportadora', 'transportadora')
      .leftJoinAndSelect('regra.centroDistribuicao', 'centroDistribuicao')
      .orderBy('regra.prioridade', 'ASC')
      .addOrderBy('regra.nome', 'ASC');

    if (query.tenantId) {
      queryBuilder.andWhere('regra.tenantId = :tenantId', {
        tenantId: query.tenantId,
      });
    }

    if (query.nome) {
      queryBuilder.andWhere('regra.nome ILIKE :nome', {
        nome: `%${query.nome}%`,
      });
    }

    if (query.marketplace) {
      queryBuilder.andWhere('regra.marketplace ILIKE :marketplace', {
        marketplace: `%${query.marketplace}%`,
      });
    }

    if (query.transportadoraId) {
      queryBuilder.andWhere('regra.transportadoraId = :transportadoraId', {
        transportadoraId: query.transportadoraId,
      });
    }

    if (query.centroDistribuicaoId) {
      queryBuilder.andWhere(
        'regra.centroDistribuicaoId = :centroDistribuicaoId',
        {
          centroDistribuicaoId: query.centroDistribuicaoId,
        },
      );
    }

    if (query.ufDestino) {
      queryBuilder.andWhere('regra.ufDestino = :ufDestino', {
        ufDestino: query.ufDestino.toUpperCase(),
      });
    }

    if (query.cepInicial) {
      queryBuilder.andWhere(
        '(regra.cepInicial IS NULL OR regra.cepInicial <= :cepInicial)',
        {
          cepInicial: query.cepInicial,
        },
      );
    }

    if (query.cepFinal) {
      queryBuilder.andWhere(
        '(regra.cepFinal IS NULL OR regra.cepFinal >= :cepFinal)',
        {
          cepFinal: query.cepFinal,
        },
      );
    }

    if (query.ativo !== undefined) {
      queryBuilder.andWhere('regra.ativo = :ativo', {
        ativo: query.ativo === 'true',
      });
    }

    if (query.pesoMin) {
      queryBuilder.andWhere(
        '(regra.pesoMin IS NULL OR regra.pesoMin <= :pesoMin)',
        {
          pesoMin: Number(query.pesoMin),
        },
      );
    }

    if (query.pesoMax) {
      queryBuilder.andWhere(
        '(regra.pesoMax IS NULL OR regra.pesoMax >= :pesoMax)',
        {
          pesoMax: Number(query.pesoMax),
        },
      );
    }

    return queryBuilder.getMany();
  }

  async findById(id: string): Promise<RegraFrete> {
    const regraFrete = await this.regrasFreteRepository.findOne({
      where: { id },
      relations: {
        transportadora: true,
        centroDistribuicao: true,
      },
    });

    if (!regraFrete) {
      throw new NotFoundException('Regra de frete nao encontrada');
    }

    return regraFrete;
  }

  async create(createRegraFreteDto: CreateRegraFreteDto): Promise<RegraFrete> {
    await this.tenantsService.findById(createRegraFreteDto.tenantId);
    this.validateRanges(createRegraFreteDto);
    await this.validateDependencies(createRegraFreteDto.tenantId, {
      transportadoraId: createRegraFreteDto.transportadoraId,
      centroDistribuicaoId: createRegraFreteDto.centroDistribuicaoId,
    });

    const regraFrete = this.regrasFreteRepository.create({
      ...createRegraFreteDto,
      marketplace: createRegraFreteDto.marketplace?.trim() ?? null,
      ufDestino: createRegraFreteDto.ufDestino?.toUpperCase() ?? null,
      cepInicial: createRegraFreteDto.cepInicial ?? null,
      cepFinal: createRegraFreteDto.cepFinal ?? null,
      pesoMin: createRegraFreteDto.pesoMin ?? null,
      pesoMax: createRegraFreteDto.pesoMax ?? null,
      observacao: createRegraFreteDto.observacao?.trim() ?? null,
      ativo: true,
    });

    return this.regrasFreteRepository.save(regraFrete);
  }

  async update(id: string, updateRegraFreteDto: UpdateRegraFreteDto): Promise<RegraFrete> {
    const regraFrete = await this.findById(id);
    this.validateRanges(updateRegraFreteDto);

    await this.validateDependencies(regraFrete.tenantId, {
      transportadoraId:
        updateRegraFreteDto.transportadoraId ?? regraFrete.transportadoraId ?? undefined,
      centroDistribuicaoId:
        updateRegraFreteDto.centroDistribuicaoId ??
        regraFrete.centroDistribuicaoId ??
        undefined,
    });

    const merged = this.regrasFreteRepository.merge(regraFrete, {
      ...updateRegraFreteDto,
      marketplace:
        updateRegraFreteDto.marketplace !== undefined
          ? updateRegraFreteDto.marketplace.trim() || null
          : regraFrete.marketplace,
      ufDestino:
        updateRegraFreteDto.ufDestino !== undefined
          ? updateRegraFreteDto.ufDestino.toUpperCase()
          : regraFrete.ufDestino,
      cepInicial:
        updateRegraFreteDto.cepInicial !== undefined
          ? updateRegraFreteDto.cepInicial || null
          : regraFrete.cepInicial,
      cepFinal:
        updateRegraFreteDto.cepFinal !== undefined
          ? updateRegraFreteDto.cepFinal || null
          : regraFrete.cepFinal,
      observacao:
        updateRegraFreteDto.observacao !== undefined
          ? updateRegraFreteDto.observacao.trim() || null
          : regraFrete.observacao,
    });

    return this.regrasFreteRepository.save(merged);
  }

  async updateStatus(id: string, ativo: boolean): Promise<RegraFrete> {
    const regraFrete = await this.findById(id);
    regraFrete.ativo = ativo;
    return this.regrasFreteRepository.save(regraFrete);
  }

  async remove(id: string): Promise<{ success: true }> {
    const regraFrete = await this.findById(id);
    await this.regrasFreteRepository.remove(regraFrete);
    return { success: true };
  }

  private validateRanges(
    payload: Partial<CreateRegraFreteDto | UpdateRegraFreteDto>,
  ): void {
    const pesoMin = payload.pesoMin;
    const pesoMax = payload.pesoMax;

    if (
      pesoMin !== undefined &&
      pesoMax !== undefined &&
      pesoMin !== null &&
      pesoMax !== null &&
      pesoMin > pesoMax
    ) {
      throw new ConflictException('pesoMin nao pode ser maior que pesoMax');
    }

    const cepInicial = payload.cepInicial;
    const cepFinal = payload.cepFinal;

    if (
      cepInicial !== undefined &&
      cepFinal !== undefined &&
      cepInicial &&
      cepFinal &&
      cepInicial > cepFinal
    ) {
      throw new BadRequestException('cepInicial nao pode ser maior que cepFinal');
    }
  }

  private async validateDependencies(
    tenantId: string,
    input: {
      transportadoraId?: string;
      centroDistribuicaoId?: string;
    },
  ): Promise<void> {
    if (!input.transportadoraId) {
      throw new BadRequestException('transportadoraId e obrigatorio');
    }

    if (!input.centroDistribuicaoId) {
      throw new BadRequestException('centroDistribuicaoId e obrigatorio');
    }

    const [transportadora, centroDistribuicao] = await Promise.all([
      this.transportadorasRepository.findOne({
        where: {
          id: input.transportadoraId,
          tenantId,
        },
      }),
      this.centrosRepository.findOne({
        where: {
          id: input.centroDistribuicaoId,
          tenantId,
        },
      }),
    ]);

    if (!transportadora) {
      throw new NotFoundException('Transportadora nao encontrada para o tenant');
    }

    if (!centroDistribuicao) {
      throw new NotFoundException(
        'Centro de distribuicao nao encontrado para o tenant',
      );
    }

    if (!transportadora.ativo) {
      throw new ConflictException('Nao e permitido usar transportadora inativa');
    }

    if (!centroDistribuicao.ativo) {
      throw new ConflictException(
        'Nao e permitido usar centro de distribuicao inativo',
      );
    }
  }
}
