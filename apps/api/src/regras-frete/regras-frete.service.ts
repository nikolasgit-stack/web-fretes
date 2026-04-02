import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantsService } from '../tenants/tenants.service';
import { CreateRegraFreteDto } from './dto/create-regra-frete.dto';
import { RegraFrete } from './entities/regra-frete.entity';

@Injectable()
export class RegrasFreteService {
  constructor(
    @InjectRepository(RegraFrete)
    private readonly regrasFreteRepository: Repository<RegraFrete>,
    private readonly tenantsService: TenantsService,
  ) {}

  async findAll(): Promise<RegraFrete[]> {
    return this.regrasFreteRepository.find({
      order: {
        prioridade: 'ASC',
        criadoEm: 'DESC',
      },
    });
  }

  async findById(id: string): Promise<RegraFrete> {
    const regraFrete = await this.regrasFreteRepository.findOne({
      where: { id },
    });

    if (!regraFrete) {
      throw new NotFoundException('Regra de frete not found');
    }

    return regraFrete;
  }

  async create(createRegraFreteDto: CreateRegraFreteDto): Promise<RegraFrete> {
    await this.tenantsService.findById(createRegraFreteDto.tenantId);

    if (
      createRegraFreteDto.pesoMin !== undefined &&
      createRegraFreteDto.pesoMax !== undefined &&
      createRegraFreteDto.pesoMin > createRegraFreteDto.pesoMax
    ) {
      throw new ConflictException('pesoMin nao pode ser maior que pesoMax');
    }

    const regraFrete = this.regrasFreteRepository.create({
      ...createRegraFreteDto,
      marketplace: createRegraFreteDto.marketplace ?? null,
      ufDestino: createRegraFreteDto.ufDestino?.toUpperCase() ?? null,
      pesoMin: createRegraFreteDto.pesoMin ?? null,
      pesoMax: createRegraFreteDto.pesoMax ?? null,
      ativo: true,
    });

    return this.regrasFreteRepository.save(regraFrete);
  }
}
