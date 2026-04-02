import { PartialType } from '@nestjs/mapped-types';
import { CreateRegraFreteDto } from './create-regra-frete.dto';

export class UpdateRegraFreteDto extends PartialType(CreateRegraFreteDto) {}
