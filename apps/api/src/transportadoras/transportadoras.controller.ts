import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateTransportadoraDto } from './dto/create-transportadora.dto';
import { TransportadorasService } from './transportadoras.service';

@Controller('transportadoras')
export class TransportadorasController {
  constructor(
    private readonly transportadorasService: TransportadorasService,
  ) {}

  @Get()
  findAll() {
    return this.transportadorasService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.transportadorasService.findById(id);
  }

  @Post()
  create(@Body() createTransportadoraDto: CreateTransportadoraDto) {
    return this.transportadorasService.create(createTransportadoraDto);
  }
}
