import { AiProviderName } from './ai-provider.port';
import { RetrivalStrategy } from './architect-response.model';

export interface AIUsageLog {
  id: string;
  createdAt: Date;

  userId: string;
  projectId: string;

  provider: AiProviderName;

  model: string;
  promptVersion: string;

  retrievalStrategy: RetrivalStrategy;

  inputTokens: number;
  cachedInputTokens?: number;
  outputTokens: number;
  embeddingTokens?: number;

  latencyMs: number;
  estimatedCostUsd: number;

  evaluationRunId?: string;
  success?: boolean;
}
