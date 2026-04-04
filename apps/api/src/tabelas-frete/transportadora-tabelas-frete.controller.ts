import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FreightTableImportValidationService } from './freight-table-import-validation.service';
import { ValidateFreightTableDto } from './dto/validate-freight-table.dto';

@Controller('transportadoras/:transportadoraId/tabelas-frete')
export class TransportadoraTabelasFreteController {
  constructor(
    private readonly freightTableImportValidationService: FreightTableImportValidationService,
  ) {}

  @Post('validar')
  @UseInterceptors(
    FileInterceptor('arquivo', {
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  async validarPlanilha(
    @Param('transportadoraId', new ParseUUIDPipe()) transportadoraId: string,
    @Body() dto: ValidateFreightTableDto,
    @UploadedFile() file?: {
      originalname: string;
      mimetype: string;
      size: number;
      buffer: Buffer;
    },
  ) {
    return this.freightTableImportValidationService.validate(
      transportadoraId,
      dto,
      file,
    );
  }
}
