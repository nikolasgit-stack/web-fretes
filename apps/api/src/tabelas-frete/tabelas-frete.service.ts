import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CentrosDistribuicaoService } from '../centros-distribuicao/centros-distribuicao.service';
import { TenantsService } from '../tenants/tenants.service';
import { TransportadorasService } from '../transportadoras/transportadoras.service';
import { CreateTabelaFreteDto } from './dto/create-tabela-frete.dto';
import { TabelaFrete } from './entities/tabela-frete.entity';

@Injectable()
export class TabelasFreteService {
  constructor(
    @InjectRepository(TabelaFrete)
    private readonly tabelasFreteRepository: Repository<TabelaFrete>,
    private readonly tenantsService: TenantsService,
    private readonly transportadorasService: TransportadorasService,
    private readonly centrosDistribuicaoService: CentrosDistribuicaoService,
  ) {}

  async findAll(): Promise<TabelaFrete[]> {
    return this.tabelasFreteRepository.find({
      relations: {
        transportadora: true,
        centroDistribuicao: true,
      },
      order: {
        criadoEm: 'DESC',
      },
    });
  }

  async findById(id: string): Promise<TabelaFrete> {
    const tabelaFrete = await this.tabelasFreteRepository.findOne({
      where: { id },
      relations: {
        transportadora: true,
        centroDistribuicao: true,
      },
    });

    if (!tabelaFrete) {
      throw new NotFoundException('Tabela de frete not found');
    }

    return tabelaFrete;
  }

  async create(createTabelaFreteDto: CreateTabelaFreteDto): Promise<TabelaFrete> {
    await this.tenantsService.findById(createTabelaFreteDto.tenantId);

    const transportadora = await this.transportadorasService.findById(
      createTabelaFreteDto.transportadoraId,
    );
    const centroDistribuicao = await this.centrosDistribuicaoService.findById(
      createTabelaFreteDto.centroDistribuicaoId,
    );

    if (
      transportadora.tenantId !== createTabelaFreteDto.tenantId ||
      centroDistribuicao.tenantId !== createTabelaFreteDto.tenantId
    ) {
      throw new ConflictException(
        'Transportadora e centro de distribuicao devem pertencer ao mesmo tenant da tabela',
      );
    }

    const existing = await this.tabelasFreteRepository.findOne({
      where: {
        tenantId: createTabelaFreteDto.tenantId,
        transportadoraId: createTabelaFreteDto.transportadoraId,
        centroDistribuicaoId: createTabelaFreteDto.centroDistribuicaoId,
        tipoTabela: createTabelaFreteDto.tipoTabela,
        vigenciaInicio: createTabelaFreteDto.vigenciaInicio,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Ja existe tabela de frete com a mesma combinacao para este tenant',
      );
    }

    const tabelaFrete = this.tabelasFreteRepository.create({
      ...createTabelaFreteDto,
      ativa: true,
      vigenciaFim: createTabelaFreteDto.vigenciaFim ?? null,
    });

    return this.tabelasFreteRepository.save(tabelaFrete);
  }
}
