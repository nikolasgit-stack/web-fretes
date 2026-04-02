import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { ProdutosService } from './produtos.service';

@Controller('produtos')
export class ProdutosController {
  constructor(private readonly produtosService: ProdutosService) {}

  @Get()
  findAll() {
    return this.produtosService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.produtosService.findById(id);
  }

  @Post()
  create(@Body() createProdutoDto: CreateProdutoDto) {
    return this.produtosService.create(createProdutoDto);
  }
}
