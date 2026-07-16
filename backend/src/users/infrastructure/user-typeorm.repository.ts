import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { User } from '../domain/user.model';
import type { UserRepository } from '../domain/user-repository.port';
import { UserEntity } from './user.entity';

@Injectable()
export class UserTypeormRepository implements UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { email } });
    return entity ? this.toDomain(entity) : null;
  }

  async create(data: Pick<User, 'email' | 'displayName'>): Promise<User> {
    const entity = await this.repository.save(this.repository.create(data));
    return this.toDomain(entity);
  }

  private toDomain(entity: UserEntity): User {
    return {
      id: entity.id,
      email: entity.email,
      displayName: entity.displayName,
      role: entity.role,
      createdAt: entity.createdAt,
    };
  }
}
