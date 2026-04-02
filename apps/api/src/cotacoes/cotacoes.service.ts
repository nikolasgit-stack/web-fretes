import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cotacao } from './entities/cotacao.entity';

@Injectable()
export class CotacoesService {
  constructor(
    @InjectRepository(Cotacao)
    private readonly cotacoesRepository: Repository<Cotacao>,
  ) {}

  async findAll(): Promise<Cotacao[]> {
    return this.cotacoesRepository.find({
      relations: {
        melhorOpcao: true,
        opcoes: true,
      },
      order: {
        criadoEm: 'DESC',
      },
    });
  }

  async findById(id: string): Promise<Cotacao> {
    const cotacao = await this.cotacoesRepository.findOne({
      where: { id },
      relations: {
        melhorOpcao: true,
        opcoes: true,
      },
    });

    if (!cotacao) {
      throw new NotFoundException('Cotacao not found');
    }

    return cotacao;
  }

  create(data: Partial<Cotacao>): Cotacao {
    return this.cotacoesRepository.create(data);
  }

  save(cotacao: Cotacao): Promise<Cotacao> {
    return this.cotacoesRepository.save(cotacao);
  }
}
