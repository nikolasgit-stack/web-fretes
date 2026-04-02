import { PartialType } from '@nestjs/mapped-types';
import { CreateCentroDistribuicaoDto } from './create-centro-distribuicao.dto';

export class UpdateCentroDistribuicaoDto extends PartialType(CreateCentroDistribuicaoDto) {}
