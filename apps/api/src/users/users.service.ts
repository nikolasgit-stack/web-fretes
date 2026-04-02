import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantsService } from '../tenants/tenants.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly tenantsService: TenantsService,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: {
        tenant: true,
      },
      order: {
        criadoEm: 'DESC',
      },
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: {
        tenant: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmailWithinTenant(
    tenantId: string,
    email: string,
  ): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.senha')
      .leftJoinAndSelect('user.tenant', 'tenant')
      .where('user.tenantId = :tenantId', { tenantId })
      .andWhere('LOWER(user.email) = LOWER(:email)', { email })
      .getOne();
  }

  async findByTenantId(tenantId: string): Promise<User[]> {
    await this.tenantsService.findById(tenantId);

    return this.usersRepository.find({
      where: { tenantId },
      relations: {
        tenant: true,
      },
      order: {
        criadoEm: 'DESC',
      },
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    await this.tenantsService.findById(createUserDto.tenantId);

    const existingUser = await this.usersRepository.findOne({
      where: {
        tenantId: createUserDto.tenantId,
        email: createUserDto.email.toLowerCase(),
      },
    });

    if (existingUser) {
      throw new ConflictException('User email already exists for tenant');
    }

    const user = this.usersRepository.create({
      tenantId: createUserDto.tenantId,
      nome: createUserDto.nome,
      email: createUserDto.email.toLowerCase(),
      senha: createUserDto.senha,
      ativo: true,
    });

    const savedUser = await this.usersRepository.save(user);
    return this.findById(savedUser.id);
  }
}
