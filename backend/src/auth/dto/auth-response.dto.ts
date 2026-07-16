import { UserResponseDto } from './user-response.dto';

export class AuthResponseDto {
  accessToken!: string;
  user!: UserResponseDto;
}
