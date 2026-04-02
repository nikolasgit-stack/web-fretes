import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantsService } from '../tenants/tenants.service';
import { CreateTransportadoraDto } from './dto/create-transportadora.dto';
import { Transportadora } from './entities/transportadora.entity';

@Injectable()
export class TransportadorasService {
  constructor(
    @InjectRepository(Transportadora)
    private readonly transportadorasRepository: Repository<Transportadora>,
    private readonly tenantsService: TenantsService,
  ) {}

  async findAll(): Promise<Transportadora[]> {
    return this.transportadorasRepository.find({
      order: {
        criadoEm: 'DESC',
      },
    });
  }

  async findById(id: string): Promise<Transportadora> {
    const transportadora = await this.transportadorasRepository.findOne({
      where: { id },
      relations: {
        tabelasFrete: true,
      },
    });

    if (!transportadora) {
      throw new NotFoundException('Transportadora not found');
    }

    return transportadora;
  }

  async create(
    createTransportadoraDto: CreateTransportadoraDto,
  ): Promise<Transportadora> {
    await this.tenantsService.findById(createTransportadoraDto.tenantId);

    const existing = await this.transportadorasRepository.findOne({
      where: {
        tenantId: createTransportadoraDto.tenantId,
        codigoInterno: createTransportadoraDto.codigoInterno,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Codigo interno de transportadora ja cadastrado para o tenant',
      );
    }

    const transportadora = this.transportadorasRepository.create({
      ...createTransportadoraDto,
      estadoOrigem: createTransportadoraDto.estadoOrigem.toUpperCase(),
      ativo: true,
      limiteAltura: createTransportadoraDto.limiteAltura ?? null,
      limiteLargura: createTransportadoraDto.limiteLargura ?? null,
      limiteComprimento: createTransportadoraDto.limiteComprimento ?? null,
    });

    return this.transportadorasRepository.save(transportadora);
  }
}
