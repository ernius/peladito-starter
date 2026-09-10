import type { AIUsageLog } from './log.model';

export const AI_USAGE_LOG_REPOSITORY = Symbol('AI_USAGE_LOG_REPOSITORY');

export interface AiUsageLogRepository {
  create(data: Omit<AIUsageLog, 'id' | 'createdAt'>): Promise<AIUsageLog>;
}
