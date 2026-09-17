import 'dotenv/config';
import { DataSource } from 'typeorm';
import { DocumentEntity } from './document.entity';

// Standalone DataSource for scripts that need document persistence without
// bootstrapping the full Nest app (e.g. experiments/run-experiment.ts).
// Scoped to DocumentEntity only, so it stays isolated from unrelated entities.
export function createDocumentDataSource(): DataSource {
  return new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: parseInt(process.env.DATABASE_PORT ?? '5435', 10),
    username: process.env.DATABASE_USER ?? 'peladito',
    password: process.env.DATABASE_PASSWORD ?? 'peladito',
    database: process.env.DATABASE_NAME ?? 'peladito',
    entities: [DocumentEntity],
  });
}
