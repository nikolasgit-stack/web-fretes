import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateCentroDistribuicaoDto } from './dto/create-centro-distribuicao.dto';
import { ListCentrosDistribuicaoDto } from './dto/list-centros-distribuicao.dto';
import { UpdateCentroDistribuicaoDto } from './dto/update-centro-distribuicao.dto';
import { CentrosDistribuicaoService } from './centros-distribuicao.service';

@Controller('centros-distribuicao')
export class CentrosDistribuicaoController {
  constructor(
    private readonly centrosDistribuicaoService: CentrosDistribuicaoService,
  ) {}

  @Get()
  findAll(@Query() query: ListCentrosDistribuicaoDto) {
    return this.centrosDistribuicaoService.findAll(query);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.centrosDistribuicaoService.findById(id);
  }

  @Post()
  create(@Body() createCentroDistribuicaoDto: CreateCentroDistribuicaoDto) {
    return this.centrosDistribuicaoService.create(createCentroDistribuicaoDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCentroDistribuicaoDto: UpdateCentroDistribuicaoDto,
  ) {
    return this.centrosDistribuicaoService.update(id, updateCentroDistribuicaoDto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { ativo: boolean }) {
    return this.centrosDistribuicaoService.updateStatus(id, body.ativo);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.centrosDistribuicaoService.remove(id);
  }
}
