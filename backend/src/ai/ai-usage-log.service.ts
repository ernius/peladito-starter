import { Inject, Injectable, Logger } from '@nestjs/common';
import type { RetrivalStrategy } from './domain/architect-response.model';
import type { AiProviderName } from './domain/ai-provider.port';
import {
  AI_USAGE_LOG_REPOSITORY,
  type AiUsageLogRepository,
} from './domain/ai-usage-log-repository.port';
import type { AIUsageLog } from './domain/log.model';

// TODO(participante): no existe todavía un modelo de "proyecto" — se usa un
// placeholder fijo hasta que se defina esa entidad.
const PLACEHOLDER_PROJECT_ID = 'default';

export interface RecordChatUsageParams {
  userId: string;
  providerName: AiProviderName;
  model: string | undefined;
  promptVersion: string;
  retrievalStrategy: RetrivalStrategy;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  success: boolean;
}

@Injectable()
export class AiUsageLogService {
  private readonly logger = new Logger(AiUsageLogService.name);

  constructor(
    @Inject(AI_USAGE_LOG_REPOSITORY)
    private readonly usageLogs: AiUsageLogRepository,
  ) {}

  async recordChatUsage(params: RecordChatUsageParams): Promise<void> {
    const log: Omit<AIUsageLog, 'id' | 'createdAt'> = {
      userId: params.userId,
      projectId: PLACEHOLDER_PROJECT_ID,
      provider: params.providerName,
      // TODO(participante): el modelo real usado lo decide cada provider
      // adapter cuando no se especifica uno; no hay forma de conocerlo aquí.
      model: params.model ?? 'default',
      promptVersion: params.promptVersion,
      retrievalStrategy: params.retrievalStrategy,
      inputTokens: params.inputTokens,
      outputTokens: params.outputTokens,
      latencyMs: params.latencyMs,
      // TODO(participante): no hay tabla de precios por modelo todavía.
      estimatedCostUsd: 0,
      success: params.success,
    };

    try {
      await this.usageLogs.create(log);
    } catch (err) {
      this.logger.error(
        'Failed to persist AI usage log',
        err instanceof Error ? err.stack : err,
      );
    }
  }
}
