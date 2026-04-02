import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { RegraFrete } from '../regras-frete/entities/regra-frete.entity';
import { TabelaFrete } from '../tabelas-frete/entities/tabela-frete.entity';
import { TenantsService } from '../tenants/tenants.service';
import { CreateTransportadoraDto } from './dto/create-transportadora.dto';
import { ListTransportadorasDto } from './dto/list-transportadoras.dto';
import { UpdateTransportadoraDto } from './dto/update-transportadora.dto';
import {
  TipoIntegracaoTransportadora,
  Transportadora,
} from './entities/transportadora.entity';

@Injectable()
export class TransportadorasService {
  constructor(
    @InjectRepository(Transportadora)
    private readonly transportadorasRepository: Repository<Transportadora>,
    @InjectRepository(TabelaFrete)
    private readonly tabelasFreteRepository: Repository<TabelaFrete>,
    @InjectRepository(RegraFrete)
    private readonly regrasFreteRepository: Repository<RegraFrete>,
    private readonly tenantsService: TenantsService,
  ) {}

  async findAll(query: ListTransportadorasDto): Promise<Transportadora[]> {
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

    if (query.modalidade) {
      where.modalidade = ILike(`%${query.modalidade}%`);
    }

    if (query.tipoIntegracao) {
      where.tipoIntegracao = query.tipoIntegracao;
    }

    if (query.estadoOrigem) {
      where.estadoOrigem = query.estadoOrigem.toUpperCase();
    }

    if (query.ativo !== undefined) {
      where.ativo = query.ativo === 'true';
    }

    return this.transportadorasRepository.find({
      where,
      order: {
        nome: 'ASC',
      },
    });
  }

  async findById(id: string): Promise<Transportadora> {
    const transportadora = await this.transportadorasRepository.findOne({
      where: { id },
      relations: {
        tabelasFrete: true,
        regrasFrete: true,
      },
    });

    if (!transportadora) {
      throw new NotFoundException('Transportadora nao encontrada');
    }

    return transportadora;
  }

  async create(
    createTransportadoraDto: CreateTransportadoraDto,
  ): Promise<Transportadora> {
    await this.tenantsService.findById(createTransportadoraDto.tenantId);
    this.validateLimites(createTransportadoraDto);

    await this.ensureUniqueCodigoInterno(
      createTransportadoraDto.tenantId,
      createTransportadoraDto.codigoInterno,
    );

    const transportadora = this.transportadorasRepository.create({
      ...createTransportadoraDto,
      modalidade: createTransportadoraDto.modalidade?.trim() ?? null,
      contato: createTransportadoraDto.contato?.trim() ?? null,
      observacao: createTransportadoraDto.observacao?.trim() ?? null,
      estadoOrigem: createTransportadoraDto.estadoOrigem.toUpperCase(),
      tipoIntegracao:
        createTransportadoraDto.tipoIntegracao ??
        TipoIntegracaoTransportadora.MANUAL,
      ativo: true,
      limiteAltura: createTransportadoraDto.limiteAltura ?? null,
      limiteLargura: createTransportadoraDto.limiteLargura ?? null,
      limiteComprimento: createTransportadoraDto.limiteComprimento ?? null,
    });

    return this.transportadorasRepository.save(transportadora);
  }

  async update(
    id: string,
    updateTransportadoraDto: UpdateTransportadoraDto,
  ): Promise<Transportadora> {
    const transportadora = await this.findById(id);
    this.validateLimites(updateTransportadoraDto);

    if (
      updateTransportadoraDto.codigoInterno &&
      updateTransportadoraDto.codigoInterno !== transportadora.codigoInterno
    ) {
      await this.ensureUniqueCodigoInterno(
        transportadora.tenantId,
        updateTransportadoraDto.codigoInterno,
        id,
      );
    }

    const merged = this.transportadorasRepository.merge(transportadora, {
      ...updateTransportadoraDto,
      modalidade: updateTransportadoraDto.modalidade?.trim() ?? transportadora.modalidade,
      contato: updateTransportadoraDto.contato?.trim() ?? transportadora.contato,
      observacao:
        updateTransportadoraDto.observacao !== undefined
          ? updateTransportadoraDto.observacao.trim() || null
          : transportadora.observacao,
      estadoOrigem: updateTransportadoraDto.estadoOrigem
        ? updateTransportadoraDto.estadoOrigem.toUpperCase()
        : transportadora.estadoOrigem,
    });

    return this.transportadorasRepository.save(merged);
  }

  async updateStatus(id: string, ativo: boolean): Promise<Transportadora> {
    const transportadora = await this.findById(id);
    transportadora.ativo = ativo;
    return this.transportadorasRepository.save(transportadora);
  }

  async remove(id: string): Promise<{ success: true }> {
    const transportadora = await this.findById(id);

    const [tabelasVinculadas, regrasVinculadas] = await Promise.all([
      this.tabelasFreteRepository.count({
        where: {
          transportadoraId: transportadora.id,
        },
      }),
      this.regrasFreteRepository.count({
        where: {
          transportadoraId: transportadora.id,
        },
      }),
    ]);

    if (tabelasVinculadas > 0 || regrasVinculadas > 0) {
      throw new ConflictException(
        'Nao e possivel excluir a transportadora porque existem vinculos operacionais',
      );
    }

    await this.transportadorasRepository.remove(transportadora);
    return { success: true };
  }

  private validateLimites(
    payload: Partial<CreateTransportadoraDto | UpdateTransportadoraDto>,
  ): void {
    const limites = [
      payload.limiteAltura,
      payload.limiteLargura,
      payload.limiteComprimento,
    ];

    if (limites.some((value) => value !== undefined && value !== null && value < 0)) {
      throw new BadRequestException('Limites de dimensao nao podem ser negativos');
    }
  }

  private async ensureUniqueCodigoInterno(
    tenantId: string,
    codigoInterno: string,
    ignoreId?: string,
  ): Promise<void> {
    const existing = await this.transportadorasRepository.findOne({
      where: {
        tenantId,
        codigoInterno,
      },
    });

    if (existing && existing.id !== ignoreId) {
      throw new ConflictException(
        'Codigo interno de transportadora ja cadastrado para o tenant',
      );
    }
  }
}
