import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsers1752600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email varchar(320) NOT NULL,
        display_name varchar(120) NOT NULL,
        role varchar(20) NOT NULL DEFAULT 'USER',
        created_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz
      )
    `);

    await queryRunner.query(
      `CREATE UNIQUE INDEX idx_users_email ON users (email) WHERE deleted_at IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE users`);
  }
}
