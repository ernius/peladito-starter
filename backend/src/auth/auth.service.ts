import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { User } from '../users/domain/user.model';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../users/domain/user-repository.port';
import type { LoginDto } from './dto/login.dto';
import type { JwtPayload } from './jwt.strategy';

// ponytail: auth de identificación sin password — alcanza para el lab.
// Si el producto sale del lab, migrar a Clerk o Better Auth.
@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepository,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<{ accessToken: string; user: User }> {
    const email = dto.email.toLowerCase();

    const user =
      (await this.users.findByEmail(email)) ??
      (await this.users.create({ email, displayName: dto.displayName }));

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: await this.jwt.signAsync(payload),
      user,
    };
  }

  async getById(id: string): Promise<User> {
    const user = await this.users.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
