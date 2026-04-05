import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LocalFileStorageService } from '../uploads/local-file-storage.service';
import { ListTransportadoraFreightTablesDto } from './dto/list-transportadora-freight-tables.dto';
import { UploadFreightTableDto } from './dto/upload-freight-table.dto';
import { TabelasFreteService } from './tabelas-frete.service';

@Controller('transportadoras/:transportadoraId/tabelas-frete')
export class TransportadoraTabelasFreteController {
  constructor(
    private readonly tabelasFreteService: TabelasFreteService,
    private readonly localFileStorageService: LocalFileStorageService,
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
    @Body() dto: UploadFreightTableDto,
    @UploadedFile() file?: {
      originalname: string;
      mimetype: string;
      size: number;
      buffer: Buffer;
    },
  ) {
    return this.tabelasFreteService.validateUpload(
      transportadoraId,
      dto,
      file,
    );
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('arquivo', {
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  async importarPlanilha(
    @Param('transportadoraId', new ParseUUIDPipe()) transportadoraId: string,
    @Body() dto: UploadFreightTableDto,
    @UploadedFile() file?: {
      originalname: string;
      mimetype: string;
      size: number;
      buffer: Buffer;
    },
  ) {
    return this.tabelasFreteService.upload(
      transportadoraId,
      dto,
      file,
    );
  }

  @Get()
  async listarTabelas(
    @Param('transportadoraId', new ParseUUIDPipe()) transportadoraId: string,
    @Query() query: ListTransportadoraFreightTablesDto,
  ) {
    return this.tabelasFreteService.listByTransportadora(transportadoraId, query);
  }

  @Get(':tableId')
  async detalharTabela(
    @Param('transportadoraId', new ParseUUIDPipe()) transportadoraId: string,
    @Param('tableId', new ParseUUIDPipe()) tableId: string,
  ) {
    return this.tabelasFreteService.getImportedTable(transportadoraId, tableId);
  }

  @Get(':tableId/preview')
  async previewTabela(
    @Param('transportadoraId', new ParseUUIDPipe()) transportadoraId: string,
    @Param('tableId', new ParseUUIDPipe()) tableId: string,
  ) {
    return this.tabelasFreteService.getImportedTablePreview(transportadoraId, tableId);
  }

  @Get(':tableId/download')
  async downloadTabela(
    @Param('transportadoraId', new ParseUUIDPipe()) transportadoraId: string,
    @Param('tableId', new ParseUUIDPipe()) tableId: string,
    @Res({ passthrough: true }) response: {
      setHeader: (name: string, value: string) => void;
    },
  ) {
    const fileInfo = await this.tabelasFreteService.getDownloadInfo(
      transportadoraId,
      tableId,
    );
    const file = await this.localFileStorageService.readFile(fileInfo.storagePath);

    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${fileInfo.nomeArquivoOriginal}"`,
    );
    response.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    return new StreamableFile(file.buffer);
  }

  @Delete(':tableId')
  async inativarTabela(
    @Param('transportadoraId', new ParseUUIDPipe()) transportadoraId: string,
    @Param('tableId', new ParseUUIDPipe()) tableId: string,
  ) {
    return this.tabelasFreteService.inactivateImportedTable(
      transportadoraId,
      tableId,
    );
  }
}
