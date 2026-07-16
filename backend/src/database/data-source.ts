import 'dotenv/config';
import { DataSource } from 'typeorm';

// Solo para la CLI de TypeORM (migraciones). La app usa TypeOrmModule.
export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: parseInt(process.env.DATABASE_PORT ?? '5435', 10),
  username: process.env.DATABASE_USER ?? 'peladito',
  password: process.env.DATABASE_PASSWORD ?? 'peladito',
  database: process.env.DATABASE_NAME ?? 'peladito',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
});
