import { AiProviderName } from './ai-provider.port';

export const RetrivalStrategy = {
  NO_RETRIEVAL: 'NO_RETRIEVAL',
  FULL_CONTEXT: 'FULL_CONTEXT',
  EXACT_LOOKUP: 'EXACT_LOOKUP',
  MANAGED_FILE_SEARCH: 'MANAGED_FILE_SEARCH',
  CUSTOM_RAG: 'CUSTOM_RAG',
  HYBRID: 'HYBRID',
} as const;

export type RetrivalStrategy =
  (typeof RetrivalStrategy)[keyof typeof RetrivalStrategy];

export interface AIUsageLog {
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
