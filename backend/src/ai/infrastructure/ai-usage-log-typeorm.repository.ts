import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { AIUsageLog } from '../domain/log.model';
import type { AiUsageLogRepository } from '../domain/ai-usage-log-repository.port';
import { AiUsageLogEntity } from './ai-usage-log.entity';

@Injectable()
export class AiUsageLogTypeormRepository implements AiUsageLogRepository {
  constructor(
    @InjectRepository(AiUsageLogEntity)
    private readonly repository: Repository<AiUsageLogEntity>,
  ) {}

  async create(
    data: Omit<AIUsageLog, 'id' | 'createdAt'>,
  ): Promise<AIUsageLog> {
    const entity = await this.repository.save(
      this.repository.create({
        ...data,
        cachedInputTokens: data.cachedInputTokens ?? null,
        embeddingTokens: data.embeddingTokens ?? null,
        evaluationRunId: data.evaluationRunId ?? null,
        success: data.success ?? null,
      }),
    );
    return this.toDomain(entity);
  }

  private toDomain(entity: AiUsageLogEntity): AIUsageLog {
    return {
      id: entity.id,
      createdAt: entity.createdAt,
      userId: entity.userId,
      projectId: entity.projectId,
      provider: entity.provider,
      model: entity.model,
      promptVersion: entity.promptVersion,
      retrievalStrategy: entity.retrievalStrategy,
      inputTokens: entity.inputTokens,
      cachedInputTokens: entity.cachedInputTokens ?? undefined,
      outputTokens: entity.outputTokens,
      embeddingTokens: entity.embeddingTokens ?? undefined,
      latencyMs: entity.latencyMs,
      estimatedCostUsd: Number(entity.estimatedCostUsd),
      evaluationRunId: entity.evaluationRunId ?? undefined,
      success: entity.success ?? undefined,
    };
  }
}
