import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateCentroDistribuicaoDto } from './dto/create-centro-distribuicao.dto';
import { CentrosDistribuicaoService } from './centros-distribuicao.service';

@Controller('centros-distribuicao')
export class CentrosDistribuicaoController {
  constructor(
    private readonly centrosDistribuicaoService: CentrosDistribuicaoService,
  ) {}

  @Get()
  findAll() {
    return this.centrosDistribuicaoService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.centrosDistribuicaoService.findById(id);
  }

  @Post()
  create(@Body() createCentroDistribuicaoDto: CreateCentroDistribuicaoDto) {
    return this.centrosDistribuicaoService.create(createCentroDistribuicaoDto);
  }
}
