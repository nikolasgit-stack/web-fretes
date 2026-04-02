import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantsService } from '../tenants/tenants.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { Produto } from './entities/produto.entity';

@Injectable()
export class ProdutosService {
  constructor(
    @InjectRepository(Produto)
    private readonly produtosRepository: Repository<Produto>,
    private readonly tenantsService: TenantsService,
  ) {}

  async findAll(): Promise<Produto[]> {
    return this.produtosRepository.find({
      order: {
        criadoEm: 'DESC',
      },
    });
  }

  async findById(id: string): Promise<Produto> {
    const produto = await this.produtosRepository.findOne({
      where: { id },
    });

    if (!produto) {
      throw new NotFoundException('Produto not found');
    }

    return produto;
  }

  async create(createProdutoDto: CreateProdutoDto): Promise<Produto> {
    await this.tenantsService.findById(createProdutoDto.tenantId);

    const existing = await this.produtosRepository.findOne({
      where: {
        tenantId: createProdutoDto.tenantId,
        sku: createProdutoDto.sku,
      },
    });

    if (existing) {
      throw new ConflictException('SKU ja cadastrado para o tenant');
    }

    const produto = this.produtosRepository.create({
      ...createProdutoDto,
      ativo: true,
    });

    return this.produtosRepository.save(produto);
  }
}
