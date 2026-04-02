import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.usersService.findByEmailWithinTenant(
      loginDto.tenantId,
      loginDto.email,
    );

    if (!user || !user.ativo || user.senha !== loginDto.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      accessToken: `bootstrap-access-token-${user.id}`,
      refreshToken: `bootstrap-refresh-token-${user.id}`,
      tenantId: user.tenantId,
      userId: user.id,
      email: user.email,
    };
  }
}
