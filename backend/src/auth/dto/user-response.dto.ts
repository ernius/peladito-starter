import { Expose } from 'class-transformer';
import type { UserRole } from '../../users/domain/user.model';

export class UserResponseDto {
  @Expose()
  id!: string;

  @Expose()
  email!: string;

  @Expose()
  displayName!: string;

  @Expose()
  role!: UserRole;
}
