import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { USER_REPOSITORY } from './domain/user-repository.port';
import { UserEntity } from './infrastructure/user.entity';
import { UserTypeormRepository } from './infrastructure/user-typeorm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: UserTypeormRepository,
    },
  ],
  exports: [USER_REPOSITORY],
})
export class UsersModule {}
