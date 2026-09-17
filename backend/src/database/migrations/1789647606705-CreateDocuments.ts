import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDocuments1789647606705 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE documents (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id varchar(120) NOT NULL,
        title varchar(255) NOT NULL,
        type varchar(20) NOT NULL,
        version varchar(40) NOT NULL,
        status varchar(20) NOT NULL,
        effective_date timestamptz,
        supersedes_document_id uuid REFERENCES documents(id),
        tags text[] NOT NULL DEFAULT '{}',
        component varchar(120),
        content text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz
      )
    `);

    await queryRunner.query(
      `CREATE INDEX idx_documents_project_id ON documents (project_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_documents_supersedes_document_id ON documents (supersedes_document_id)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE documents`);
  }
}
