import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CotacaoOpcao } from './entities/cotacao-opcao.entity';

@Injectable()
export class CotacoesOpcoesService {
  constructor(
    @InjectRepository(CotacaoOpcao)
    private readonly cotacoesOpcoesRepository: Repository<CotacaoOpcao>,
  ) {}

  async findByCotacaoId(cotacaoId: string): Promise<CotacaoOpcao[]> {
    return this.cotacoesOpcoesRepository.find({
      where: { cotacaoId },
      relations: {
        transportadora: true,
      },
      order: {
        tarifaExibida: 'ASC',
        prazo: 'ASC',
      },
    });
  }

  async findById(id: string): Promise<CotacaoOpcao> {
    const opcao = await this.cotacoesOpcoesRepository.findOne({
      where: { id },
      relations: {
        transportadora: true,
      },
    });

    if (!opcao) {
      throw new NotFoundException('Cotacao opcao not found');
    }

    return opcao;
  }

  createMany(data: Partial<CotacaoOpcao>[]): CotacaoOpcao[] {
    return this.cotacoesOpcoesRepository.create(data);
  }

  saveMany(opcoes: CotacaoOpcao[]): Promise<CotacaoOpcao[]> {
    return this.cotacoesOpcoesRepository.save(opcoes);
  }
}
