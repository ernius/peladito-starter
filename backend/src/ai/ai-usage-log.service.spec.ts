import { Test } from '@nestjs/testing';
import {
  AI_USAGE_LOG_REPOSITORY,
  type AiUsageLogRepository,
} from './domain/ai-usage-log-repository.port';
import type { AIUsageLog } from './domain/log.model';
import { AiProviderName } from './domain/ai-provider.port';
import { RetrivalStrategy } from './domain/architect-response.model';
import { AiUsageLogService } from './ai-usage-log.service';

describe('AiUsageLogService', () => {
  let service: AiUsageLogService;
  let usageLogs: jest.Mocked<AiUsageLogRepository>;

  beforeEach(async () => {
    usageLogs = { create: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AiUsageLogService,
        { provide: AI_USAGE_LOG_REPOSITORY, useValue: usageLogs },
      ],
    }).compile();

    service = moduleRef.get(AiUsageLogService);
  });

  it('persists a usage log row built from the given data', async () => {
    usageLogs.create.mockResolvedValue({} as AIUsageLog);

    await service.recordChatUsage({
      userId: 'user-1',
      providerName: AiProviderName.ANTHROPIC,
      model: 'claude-opus-4-5',
      promptVersion: 'v1',
      retrievalStrategy: RetrivalStrategy.NO_RETRIEVAL,
      latencyMs: 42,
      inputTokens: 10,
      outputTokens: 20,
      success: true,
    });

    expect(usageLogs.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        provider: AiProviderName.ANTHROPIC,
        model: 'claude-opus-4-5',
        promptVersion: 'v1',
        retrievalStrategy: RetrivalStrategy.NO_RETRIEVAL,
        latencyMs: 42,
        inputTokens: 10,
        outputTokens: 20,
        estimatedCostUsd: 0,
        success: true,
      }),
    );
  });

  it('defaults model to "default" when none is given', async () => {
    usageLogs.create.mockResolvedValue({} as AIUsageLog);

    await service.recordChatUsage({
      userId: 'user-1',
      providerName: AiProviderName.ANTHROPIC,
      model: undefined,
      promptVersion: 'v1',
      retrievalStrategy: RetrivalStrategy.NO_RETRIEVAL,
      latencyMs: 1,
      inputTokens: 0,
      outputTokens: 0,
      success: false,
    });

    expect(usageLogs.create).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'default' }),
    );
  });

  it('swallows repository failures instead of throwing', async () => {
    usageLogs.create.mockRejectedValue(new Error('db down'));

    await expect(
      service.recordChatUsage({
        userId: 'user-1',
        providerName: AiProviderName.ANTHROPIC,
        model: 'claude-opus-4-5',
        promptVersion: 'v1',
        retrievalStrategy: RetrivalStrategy.NO_RETRIEVAL,
        latencyMs: 1,
        inputTokens: 0,
        outputTokens: 0,
        success: true,
      }),
    ).resolves.toBeUndefined();
  });
});
