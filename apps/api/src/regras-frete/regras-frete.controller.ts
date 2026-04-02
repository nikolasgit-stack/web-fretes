import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateRegraFreteDto } from './dto/create-regra-frete.dto';
import { RegrasFreteService } from './regras-frete.service';

@Controller('regras-frete')
export class RegrasFreteController {
  constructor(private readonly regrasFreteService: RegrasFreteService) {}

  @Get()
  findAll() {
    return this.regrasFreteService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.regrasFreteService.findById(id);
  }

  @Post()
  create(@Body() createRegraFreteDto: CreateRegraFreteDto) {
    return this.regrasFreteService.create(createRegraFreteDto);
  }
}
