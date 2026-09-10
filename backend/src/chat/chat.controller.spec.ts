import { Test } from '@nestjs/testing';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { AiProviderRegistry } from '../ai/ai-provider.registry';
import { AiUsageLogService } from '../ai/ai-usage-log.service';
import { AiProviderName, type AiProvider } from '../ai/domain/ai-provider.port';
import { ChatController, ChatRequestDto } from './chat.controller';

const currentUser: AuthenticatedUser = {
  userId: 'user-1',
  email: 'ana@spacedev.io',
  role: 'USER',
};

describe('ChatController', () => {
  let controller: ChatController;
  let provider: jest.Mocked<AiProvider>;
  let aiUsageLog: jest.Mocked<AiUsageLogService>;

  beforeEach(async () => {
    provider = {
      name: AiProviderName.ANTHROPIC,
      complete: jest.fn(),
      isRetryable: jest.fn(),
    };
    aiUsageLog = {
      recordChatUsage: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<AiUsageLogService>;

    const moduleRef = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        {
          provide: AiProviderRegistry,
          useValue: { get: jest.fn().mockReturnValue(provider) },
        },
        { provide: AiUsageLogService, useValue: aiUsageLog },
      ],
    }).compile();

    controller = moduleRef.get(ChatController);
  });

  it('records a successful usage entry with token counts', async () => {
    provider.complete.mockResolvedValue({
      text: 'answer',
      usage: { input_tokens: 10, output_tokens: 20 },
    });
    const dto: ChatRequestDto = { prompt: 'why?', model: 'claude-opus-4-5' };

    await controller.chat(dto, currentUser);

    expect(aiUsageLog.recordChatUsage).toHaveBeenCalledTimes(1);
    expect(aiUsageLog.recordChatUsage).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        providerName: AiProviderName.ANTHROPIC,
        model: 'claude-opus-4-5',
        inputTokens: 10,
        outputTokens: 20,
        success: true,
        latencyMs: expect.any(Number) as number,
      }),
    );
  });

  it('records a failed usage entry with success false when the provider throws', async () => {
    provider.complete.mockRejectedValue(new Error('boom'));
    const dto: ChatRequestDto = { prompt: 'why?' };

    await expect(controller.chat(dto, currentUser)).rejects.toThrow();

    expect(aiUsageLog.recordChatUsage).toHaveBeenCalledTimes(1);
    expect(aiUsageLog.recordChatUsage).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        inputTokens: 0,
        outputTokens: 0,
        success: false,
        latencyMs: expect.any(Number) as number,
      }),
    );
  });
});
