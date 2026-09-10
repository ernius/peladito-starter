import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAiUsageLogs1789073362138 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE ai_usage_logs (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id),
        project_id varchar(120) NOT NULL,
        provider varchar(20) NOT NULL,
        model varchar(120) NOT NULL,
        prompt_version varchar(40) NOT NULL,
        retrieval_strategy varchar(40) NOT NULL,
        input_tokens int NOT NULL,
        cached_input_tokens int,
        output_tokens int NOT NULL,
        embedding_tokens int,
        latency_ms int NOT NULL,
        estimated_cost_usd numeric(12,6) NOT NULL,
        evaluation_run_id varchar(120),
        success boolean,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(
      `CREATE INDEX idx_ai_usage_logs_user_id ON ai_usage_logs (user_id)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE ai_usage_logs`);
  }
}
