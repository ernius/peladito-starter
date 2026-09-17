import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { DOCUMENT_REPOSITORY } from '../src/document/domain/document-repository.port';
import type { DocumentRepository } from '../src/document/domain/document-repository.port';
import {
  ArchitectureDocument,
  DocumentStatus,
  DocumentType,
} from '../src/document/domain/document.model';

const CORPUS_DIR = join(
  __dirname,
  '../../deliverable-documents/week1/corpus/v0',
);
const PROJECT_ID = 'default';
const HEADER_LINE_COUNT = 5;

type NewDocument = Omit<ArchitectureDocument, 'id' | 'createdAt' | 'updatedAt'>;

function parseEffectiveDate(value: string): Date | undefined {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) {
    return undefined;
  }
  const [, day, month, year] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

function parseDocument(fileName: string, raw: string): NewDocument | null {
  const lines = raw.split(/\r?\n/);
  const header = lines.slice(0, HEADER_LINE_COUNT);
  const metadata = new Map<string, string>();

  for (const line of header) {
    const match = /^#\s*([^:]+):\s*(.*)$/.exec(line);
    if (!match) {
      console.warn(`Skipping ${fileName}: malformed metadata line "${line}"`);
      return null;
    }
    metadata.set(match[1].trim().toLowerCase(), match[2].trim());
  }

  const title = metadata.get('title');
  const type = metadata.get('type')?.toUpperCase();
  const version = metadata.get('version');
  const status = metadata.get('status')?.toUpperCase();
  const effectiveDateRaw = metadata.get('effectivedate');

  if (!title || !type || !version || !status || !effectiveDateRaw) {
    console.warn(`Skipping ${fileName}: missing required metadata field`);
    return null;
  }

  if (!Object.values(DocumentType).includes(type)) {
    console.warn(`Skipping ${fileName}: unknown document type "${type}"`);
    return null;
  }

  if (!Object.values(DocumentStatus).includes(status)) {
    console.warn(`Skipping ${fileName}: unknown document status "${status}"`);
    return null;
  }

  const effectiveDate = parseEffectiveDate(effectiveDateRaw);
  if (!effectiveDate) {
    console.warn(
      `Skipping ${fileName}: invalid effective date "${effectiveDateRaw}" (expected DD/MM/YYYY)`,
    );
    return null;
  }

  const content = lines.slice(HEADER_LINE_COUNT).join('\n').trim();

  return {
    projectId: PROJECT_ID,
    title,
    type,
    version,
    status,
    effectiveDate,
    tags: [],
    content,
  };
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);
  const repository = app.get<DocumentRepository>(DOCUMENT_REPOSITORY);

  const fileNames = readdirSync(CORPUS_DIR).filter((name) =>
    name.endsWith('.md'),
  );

  let inserted = 0;
  for (const fileName of fileNames) {
    const raw = readFileSync(join(CORPUS_DIR, fileName), 'utf-8');
    const document = parseDocument(fileName, raw);
    if (!document) {
      continue;
    }
    await repository.create(document);
    inserted += 1;
    console.log(`Loaded ${fileName} -> "${document.title}"`);
  }

  console.log(`Done. Inserted ${inserted}/${fileNames.length} documents.`);
  await app.close();
}

void bootstrap();
