import {
  BadRequestException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AiCompletionService } from './ai-completion.service';
import { AiProviderRegistry } from './ai-provider.registry';
import { AiUsageLogService } from './ai-usage-log.service';
import {
  AiAPIConnectionError,
  AiBadRequestError,
  AiProviderName,
  AiRateLimitError,
  type AiProvider,
} from './domain/ai-provider.port';
import { RetrivalStrategy } from './domain/architect-response.model';
import { explainDecisionPrompt } from './prompts/explain-decision';

describe('AiCompletionService', () => {
  let service: AiCompletionService;
  let provider: jest.Mocked<AiProvider>;
  let aiUsageLog: jest.Mocked<AiUsageLogService>;

  const baseParams = {
    prompt: 'why?',
    userId: 'user-1',
  };

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
      providers: [
        AiCompletionService,
        {
          provide: AiProviderRegistry,
          useValue: { get: jest.fn().mockReturnValue(provider) },
        },
        { provide: AiUsageLogService, useValue: aiUsageLog },
      ],
    }).compile();

    service = moduleRef.get(AiCompletionService);
  });

  it('returns the provider result and records a successful usage entry', async () => {
    provider.complete.mockResolvedValue({
      text: 'answer',
      usage: { input_tokens: 10, output_tokens: 20 },
    });

    const result = await service.complete(baseParams);

    expect(result.text).toBe('answer');
    expect(provider.complete).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: 'why?',
        systemPrompt: explainDecisionPrompt.prompt,
        systemPromptVersion: explainDecisionPrompt.version,
      }),
    );
    expect(aiUsageLog.recordChatUsage).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        providerName: AiProviderName.ANTHROPIC,
        promptVersion: explainDecisionPrompt.version,
        retrievalStrategy: RetrivalStrategy.NO_RETRIEVAL,
        inputTokens: 10,
        outputTokens: 20,
        success: true,
        latencyMs: expect.any(Number) as number,
      }),
    );
  });

  it('records a failed usage entry and maps unexpected errors to 500', async () => {
    provider.complete.mockRejectedValue(new Error('boom'));

    await expect(service.complete(baseParams)).rejects.toThrow(
      InternalServerErrorException,
    );
    expect(aiUsageLog.recordChatUsage).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        inputTokens: 0,
        outputTokens: 0,
        success: false,
      }),
    );
  });

  it('maps AiBadRequestError to a BadRequestException', async () => {
    provider.complete.mockRejectedValue(
      new AiBadRequestError(400, {}, 'invalid', new Headers()),
    );

    await expect(service.complete(baseParams)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('maps AiRateLimitError to a 429 HttpException', async () => {
    provider.complete.mockRejectedValue(
      new AiRateLimitError(429, {}, 'slow down', new Headers()),
    );

    await expect(service.complete(baseParams)).rejects.toMatchObject({
      status: HttpStatus.TOO_MANY_REQUESTS,
    } as Partial<HttpException>);
  });

  it('maps AiAPIConnectionError to a ServiceUnavailableException', async () => {
    provider.complete.mockRejectedValue(
      new AiAPIConnectionError({ message: 'unreachable' }),
    );

    await expect(service.complete(baseParams)).rejects.toThrow(
      ServiceUnavailableException,
    );
  });
});
