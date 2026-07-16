import type { User } from './user.model';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: Pick<User, 'email' | 'displayName'>): Promise<User>;
}
