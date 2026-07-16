import { NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import type { User } from '../users/domain/user.model';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../users/domain/user-repository.port';
import { AuthService } from './auth.service';

const user: User = {
  id: 'user-1',
  email: 'ana@spacedev.io',
  displayName: 'Ana',
  role: 'USER',
  createdAt: new Date('2026-01-01'),
};

describe('AuthService', () => {
  let service: AuthService;
  let users: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    users = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: USER_REPOSITORY, useValue: users },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn().mockResolvedValue('token-123') },
        },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  describe('login', () => {
    it('returns a token for an existing user without creating it again', async () => {
      users.findByEmail.mockResolvedValue(user);

      const result = await service.login({
        email: 'Ana@SpaceDev.io',
        displayName: 'Ana',
      });

      expect(users.findByEmail).toHaveBeenCalledWith('ana@spacedev.io');
      expect(users.create).not.toHaveBeenCalled();
      expect(result).toEqual({ accessToken: 'token-123', user });
    });

    it('creates the user when the email is unknown', async () => {
      users.findByEmail.mockResolvedValue(null);
      users.create.mockResolvedValue(user);

      const result = await service.login({
        email: 'ana@spacedev.io',
        displayName: 'Ana',
      });

      expect(users.create).toHaveBeenCalledWith({
        email: 'ana@spacedev.io',
        displayName: 'Ana',
      });
      expect(result.user).toEqual(user);
    });
  });

  describe('getById', () => {
    it('throws NotFoundException when the user does not exist', async () => {
      users.findById.mockResolvedValue(null);

      await expect(service.getById('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
