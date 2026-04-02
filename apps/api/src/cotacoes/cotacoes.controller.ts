import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CotacoesService } from './cotacoes.service';
import { SimularCotacaoDto } from './dto/simular-cotacao.dto';
import { SimularCotacaoResponseDto } from './dto/simular-cotacao-response.dto';
import { SimulacoesService } from '../simulacoes/simulacoes.service';

@Controller('cotacoes')
export class CotacoesController {
  constructor(
    private readonly cotacoesService: CotacoesService,
    private readonly simulacoesService: SimulacoesService,
  ) {}

  @Get()
  findAll() {
    return this.cotacoesService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.cotacoesService.findById(id);
  }

  @Post('simular')
  simular(
    @Body() simularCotacaoDto: SimularCotacaoDto,
  ): Promise<SimularCotacaoResponseDto> {
    return this.simulacoesService.simular(simularCotacaoDto);
  }
}
