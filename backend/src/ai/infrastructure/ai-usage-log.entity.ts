import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { AiProviderName } from '../domain/ai-provider.port';
import type { RetrivalStrategy } from '../domain/architect-response.model';

@Entity('ai_usage_logs')
export class AiUsageLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_ai_usage_logs_user_id')
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'project_id', length: 120 })
  projectId!: string;

  @Column({ name: 'provider', length: 20 })
  provider!: AiProviderName;

  @Column({ name: 'model', length: 120 })
  model!: string;

  @Column({ name: 'prompt_version', length: 40 })
  promptVersion!: string;

  @Column({ name: 'retrieval_strategy', length: 40 })
  retrievalStrategy!: RetrivalStrategy;

  @Column({ name: 'input_tokens', type: 'int' })
  inputTokens!: number;

  @Column({ name: 'cached_input_tokens', type: 'int', nullable: true })
  cachedInputTokens!: number | null;

  @Column({ name: 'output_tokens', type: 'int' })
  outputTokens!: number;

  @Column({ name: 'embedding_tokens', type: 'int', nullable: true })
  embeddingTokens!: number | null;

  @Column({ name: 'latency_ms', type: 'int' })
  latencyMs!: number;

  @Column({
    name: 'estimated_cost_usd',
    type: 'numeric',
    precision: 12,
    scale: 6,
  })
  estimatedCostUsd!: number;

  @Column({
    name: 'evaluation_run_id',
    type: 'varchar',
    length: 120,
    nullable: true,
  })
  evaluationRunId!: string | null;

  @Column({ name: 'success', type: 'boolean', nullable: true })
  success!: boolean | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
