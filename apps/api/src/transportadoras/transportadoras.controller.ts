import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateTransportadoraDto } from './dto/create-transportadora.dto';
import { ListTransportadorasDto } from './dto/list-transportadoras.dto';
import { UpdateTransportadoraDto } from './dto/update-transportadora.dto';
import { TransportadorasService } from './transportadoras.service';

@Controller('transportadoras')
export class TransportadorasController {
  constructor(
    private readonly transportadorasService: TransportadorasService,
  ) {}

  @Get()
  findAll(@Query() query: ListTransportadorasDto) {
    return this.transportadorasService.findAll(query);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.transportadorasService.findById(id);
  }

  @Post()
  create(@Body() createTransportadoraDto: CreateTransportadoraDto) {
    return this.transportadorasService.create(createTransportadoraDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTransportadoraDto: UpdateTransportadoraDto,
  ) {
    return this.transportadorasService.update(id, updateTransportadoraDto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { ativo: boolean }) {
    return this.transportadorasService.updateStatus(id, body.ativo);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transportadorasService.remove(id);
  }
}
