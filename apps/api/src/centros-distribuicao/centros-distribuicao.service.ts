import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantsService } from '../tenants/tenants.service';
import { CreateCentroDistribuicaoDto } from './dto/create-centro-distribuicao.dto';
import { CentroDistribuicao } from './entities/centro-distribuicao.entity';

@Injectable()
export class CentrosDistribuicaoService {
  constructor(
    @InjectRepository(CentroDistribuicao)
    private readonly centrosRepository: Repository<CentroDistribuicao>,
    private readonly tenantsService: TenantsService,
  ) {}

  async findAll(): Promise<CentroDistribuicao[]> {
    return this.centrosRepository.find({
      order: {
        criadoEm: 'DESC',
      },
    });
  }

  async findById(id: string): Promise<CentroDistribuicao> {
    const centroDistribuicao = await this.centrosRepository.findOne({
      where: { id },
      relations: {
        tabelasFrete: true,
      },
    });

    if (!centroDistribuicao) {
      throw new NotFoundException('Centro de distribuicao not found');
    }

    return centroDistribuicao;
  }

  async create(
    createCentroDistribuicaoDto: CreateCentroDistribuicaoDto,
  ): Promise<CentroDistribuicao> {
    await this.tenantsService.findById(createCentroDistribuicaoDto.tenantId);

    const existing = await this.centrosRepository.findOne({
      where: {
        tenantId: createCentroDistribuicaoDto.tenantId,
        codigoInterno: createCentroDistribuicaoDto.codigoInterno,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Codigo interno de centro de distribuicao ja cadastrado para o tenant',
      );
    }

    const centroDistribuicao = this.centrosRepository.create({
      ...createCentroDistribuicaoDto,
      estado: createCentroDistribuicaoDto.estado.toUpperCase(),
      ativo: true,
    });

    return this.centrosRepository.save(centroDistribuicao);
  }
}
