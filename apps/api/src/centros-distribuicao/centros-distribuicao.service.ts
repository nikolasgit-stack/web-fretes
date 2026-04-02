import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { RegraFrete } from '../regras-frete/entities/regra-frete.entity';
import { TabelaFrete } from '../tabelas-frete/entities/tabela-frete.entity';
import { TenantsService } from '../tenants/tenants.service';
import { CreateCentroDistribuicaoDto } from './dto/create-centro-distribuicao.dto';
import { ListCentrosDistribuicaoDto } from './dto/list-centros-distribuicao.dto';
import { UpdateCentroDistribuicaoDto } from './dto/update-centro-distribuicao.dto';
import { CentroDistribuicao } from './entities/centro-distribuicao.entity';

@Injectable()
export class CentrosDistribuicaoService {
  constructor(
    @InjectRepository(CentroDistribuicao)
    private readonly centrosRepository: Repository<CentroDistribuicao>,
    @InjectRepository(TabelaFrete)
    private readonly tabelasFreteRepository: Repository<TabelaFrete>,
    @InjectRepository(RegraFrete)
    private readonly regrasFreteRepository: Repository<RegraFrete>,
    private readonly tenantsService: TenantsService,
  ) {}

  async findAll(
    query: ListCentrosDistribuicaoDto,
  ): Promise<CentroDistribuicao[]> {
    const where: Record<string, unknown> = {};

    if (query.tenantId) {
      where.tenantId = query.tenantId;
    }

    if (query.nome) {
      where.nome = ILike(`%${query.nome}%`);
    }

    if (query.codigoInterno) {
      where.codigoInterno = ILike(`%${query.codigoInterno}%`);
    }

    if (query.cep) {
      where.cep = query.cep;
    }

    if (query.cidade) {
      where.cidade = ILike(`%${query.cidade}%`);
    }

    if (query.estado) {
      where.estado = query.estado.toUpperCase();
    }

    if (query.ativo !== undefined) {
      where.ativo = query.ativo === 'true';
    }

    return this.centrosRepository.find({
      where,
      order: {
        nome: 'ASC',
      },
    });
  }

  async findById(id: string): Promise<CentroDistribuicao> {
    const centroDistribuicao = await this.centrosRepository.findOne({
      where: { id },
      relations: {
        tabelasFrete: true,
        regrasFrete: true,
      },
    });

    if (!centroDistribuicao) {
      throw new NotFoundException('Centro de distribuicao nao encontrado');
    }

    return centroDistribuicao;
  }

  async create(
    createCentroDistribuicaoDto: CreateCentroDistribuicaoDto,
  ): Promise<CentroDistribuicao> {
    await this.tenantsService.findById(createCentroDistribuicaoDto.tenantId);

    await this.ensureUniqueCodigoInterno(
      createCentroDistribuicaoDto.tenantId,
      createCentroDistribuicaoDto.codigoInterno,
    );

    const centroDistribuicao = this.centrosRepository.create({
      ...createCentroDistribuicaoDto,
      cep: createCentroDistribuicaoDto.cep ?? null,
      endereco: createCentroDistribuicaoDto.endereco?.trim() ?? null,
      estado: createCentroDistribuicaoDto.estado.toUpperCase(),
      ativo: true,
    });

    return this.centrosRepository.save(centroDistribuicao);
  }

  async update(
    id: string,
    updateCentroDistribuicaoDto: UpdateCentroDistribuicaoDto,
  ): Promise<CentroDistribuicao> {
    const centroDistribuicao = await this.findById(id);

    if (
      updateCentroDistribuicaoDto.codigoInterno &&
      updateCentroDistribuicaoDto.codigoInterno !== centroDistribuicao.codigoInterno
    ) {
      await this.ensureUniqueCodigoInterno(
        centroDistribuicao.tenantId,
        updateCentroDistribuicaoDto.codigoInterno,
        id,
      );
    }

    const merged = this.centrosRepository.merge(centroDistribuicao, {
      ...updateCentroDistribuicaoDto,
      cep:
        updateCentroDistribuicaoDto.cep !== undefined
          ? updateCentroDistribuicaoDto.cep
          : centroDistribuicao.cep,
      endereco:
        updateCentroDistribuicaoDto.endereco !== undefined
          ? updateCentroDistribuicaoDto.endereco.trim() || null
          : centroDistribuicao.endereco,
      estado: updateCentroDistribuicaoDto.estado
        ? updateCentroDistribuicaoDto.estado.toUpperCase()
        : centroDistribuicao.estado,
    });

    return this.centrosRepository.save(merged);
  }

  async updateStatus(id: string, ativo: boolean): Promise<CentroDistribuicao> {
    const centroDistribuicao = await this.findById(id);
    centroDistribuicao.ativo = ativo;
    return this.centrosRepository.save(centroDistribuicao);
  }

  async remove(id: string): Promise<{ success: true }> {
    const centroDistribuicao = await this.findById(id);

    const [tabelasVinculadas, regrasVinculadas] = await Promise.all([
      this.tabelasFreteRepository.count({
        where: {
          centroDistribuicaoId: centroDistribuicao.id,
        },
      }),
      this.regrasFreteRepository.count({
        where: {
          centroDistribuicaoId: centroDistribuicao.id,
        },
      }),
    ]);

    if (tabelasVinculadas > 0 || regrasVinculadas > 0) {
      throw new ConflictException(
        'Nao e possivel excluir o centro de distribuicao porque existem vinculos operacionais',
      );
    }

    await this.centrosRepository.remove(centroDistribuicao);
    return { success: true };
  }

  private async ensureUniqueCodigoInterno(
    tenantId: string,
    codigoInterno: string,
    ignoreId?: string,
  ): Promise<void> {
    const existing = await this.centrosRepository.findOne({
      where: {
        tenantId,
        codigoInterno,
      },
    });

    if (existing && existing.id !== ignoreId) {
      throw new ConflictException(
        'Codigo interno de centro de distribuicao ja cadastrado para o tenant',
      );
    }
  }
}
