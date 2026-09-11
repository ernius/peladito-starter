import { Test } from '@nestjs/testing';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { AiCompletionService } from '../ai/ai-completion.service';
import { ChatController, ChatRequestDto } from './chat.controller';

const currentUser: AuthenticatedUser = {
  userId: 'user-1',
  email: 'ana@spacedev.io',
  role: 'USER',
};

describe('ChatController', () => {
  let controller: ChatController;
  let aiCompletion: jest.Mocked<AiCompletionService>;

  beforeEach(async () => {
    aiCompletion = {
      complete: jest.fn(),
    } as unknown as jest.Mocked<AiCompletionService>;

    const moduleRef = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [{ provide: AiCompletionService, useValue: aiCompletion }],
    }).compile();

    controller = moduleRef.get(ChatController);
  });

  it('delegates the prompt and user id to AiCompletionService and maps the result to an ArchitectResponse', async () => {
    aiCompletion.complete.mockResolvedValue({ text: 'answer' });
    const dto: ChatRequestDto = { prompt: 'why?' };

    const result = await controller.chat(dto, currentUser);

    expect(aiCompletion.complete).toHaveBeenCalledWith({
      prompt: 'why?',
      userId: 'user-1',
    });
    expect(result.plainLanguageAnswer).toBe('answer');
    expect(result.status).toBe('ANSWERED');
  });

  it('propagates errors raised by AiCompletionService', async () => {
    aiCompletion.complete.mockRejectedValue(new Error('boom'));
    const dto: ChatRequestDto = { prompt: 'why?' };

    await expect(controller.chat(dto, currentUser)).rejects.toThrow('boom');
  });
});
