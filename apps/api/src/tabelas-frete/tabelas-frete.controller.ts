import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateTabelaFreteDto } from './dto/create-tabela-frete.dto';
import { TabelasFreteService } from './tabelas-frete.service';

@Controller('tabelas-frete')
export class TabelasFreteController {
  constructor(private readonly tabelasFreteService: TabelasFreteService) {}

  @Get()
  findAll() {
    return this.tabelasFreteService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.tabelasFreteService.findById(id);
  }

  @Post()
  create(@Body() createTabelaFreteDto: CreateTabelaFreteDto) {
    return this.tabelasFreteService.create(createTabelaFreteDto);
  }
}
