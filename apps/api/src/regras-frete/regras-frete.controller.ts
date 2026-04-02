import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateRegraFreteDto } from './dto/create-regra-frete.dto';
import { ListRegrasFreteDto } from './dto/list-regras-frete.dto';
import { UpdateRegraFreteDto } from './dto/update-regra-frete.dto';
import { RegrasFreteService } from './regras-frete.service';

@Controller('regras-frete')
export class RegrasFreteController {
  constructor(private readonly regrasFreteService: RegrasFreteService) {}

  @Get()
  findAll(@Query() query: ListRegrasFreteDto) {
    return this.regrasFreteService.findAll(query);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.regrasFreteService.findById(id);
  }

  @Post()
  create(@Body() createRegraFreteDto: CreateRegraFreteDto) {
    return this.regrasFreteService.create(createRegraFreteDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRegraFreteDto: UpdateRegraFreteDto) {
    return this.regrasFreteService.update(id, updateRegraFreteDto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { ativo: boolean }) {
    return this.regrasFreteService.updateStatus(id, body.ativo);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.regrasFreteService.remove(id);
  }
}
