import { plainToInstance } from 'class-transformer';
import type { User } from '../users/domain/user.model';
import { UserResponseDto } from './dto/user-response.dto';

export const UserMapper = {
  toResponse(user: User): UserResponseDto {
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  },
};
