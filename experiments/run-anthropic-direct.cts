// Run from backend/ so dotenv picks up backend/.env (needs ANTHROPIC_API_KEY):
//   npx ts-node --transpile-only --compiler-options '{"module":"commonjs","moduleResolution":"node"}' ../experiments/run-anthropic-direct.cts
// (backend's tsconfig uses "nodenext", which ts-node can't apply to a .cts file living outside the backend project; the overrides sidestep that.)
import 'dotenv/config';
import { readFileSync } from 'fs';
import { join } from 'path';
import { AnthropicProvider } from '../backend/src/ai/infrastructure/anthropic.provider';

interface EvaluationCase {
  id: number;
  question: string;
  expectedIntent: string;
  expectedStatus: string;
}

const DATASET_PATH = join(
  __dirname,
  '..',
  'deliverable-documents/week1/eval/dataset-v1.json',
);

async function main(): Promise<void> {
  const cases: EvaluationCase[] = JSON.parse(
    readFileSync(DATASET_PATH, 'utf-8'),
  );
  const experiment = cases[Math.floor(Math.random() * cases.length)];

  console.log(`Running case #${experiment.id}: "${experiment.question}"`);

  const provider = new AnthropicProvider();
  const result = await provider.complete({ prompt: experiment.question });

  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
