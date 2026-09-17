// Run from backend/ so dotenv picks up backend/.env (needs ANTHROPIC_API_KEY):
//   npx ts-node --transpile-only --compiler-options '{"module":"commonjs","moduleResolution":"node"}' ../experiments/run-ai-completion-service.cts
// (backend's tsconfig uses "nodenext", which ts-node can't apply to a .cts file living outside the backend project; the overrides sidestep that.)
//
// Wires AiCompletionService by hand instead of via Nest's DI container so this stays a
// standalone script: usage logging is swapped for an in-memory stub, everything else is
// the real service. Document retrieval (FULL_CONTEXT citations) needs the real corpus, so
// it connects directly to Postgres via a DataSource scoped to DocumentEntity only
// (requires `pnpm db:up` and the corpus loaded via `pnpm seed:documents`).
import "dotenv/config";
import { readFileSync } from "fs";
import { join } from "path";
import { createDocumentDataSource } from "../backend/src/document/infrastructure/document-data-source";
import { AiCompletionService } from "../backend/src/ai/ai-completion.service";
import { AiProviderRegistry } from "../backend/src/ai/ai-provider.registry";
import { AiUsageLogService } from "../backend/src/ai/ai-usage-log.service";
import type { AiUsageLogRepository } from "../backend/src/ai/domain/ai-usage-log-repository.port";
import type { AIUsageLog } from "../backend/src/ai/domain/log.model";
import { AnthropicProvider } from "../backend/src/ai/infrastructure/anthropic.provider";
import { OpenAiProvider } from "../backend/src/ai/infrastructure/openai.provider";
import { ArchitectIntent } from "../backend/src/ai/domain/evaluation-case.model";
import { ArchitectResponse } from "../backend/src/ai/domain/architect-response.model";
import { DocumentEntity } from "../backend/src/document/infrastructure/document.entity";
import { DocumentTypeormRepository } from "../backend/src/document/infrastructure/document-typeorm.repository";

interface EvaluationCase {
  id: number;
  question: string;
  expectedIntent: ArchitectIntent;
  expectedStatus: string;
}

const DATASET_PATH = join(
  __dirname,
  "..",
  "deliverable-documents/week1/eval/dataset-v1.json",
);

const inMemoryUsageLogRepository: AiUsageLogRepository = {
  async create(data): Promise<AIUsageLog> {
    console.log("usage log:");
    console.log(data);
    return { ...data, id: "experiment-script", createdAt: new Date() };
  },
};

const documentDataSource = createDocumentDataSource();

async function main(): Promise<void> {
  const cases: EvaluationCase[] = JSON.parse(
    readFileSync(DATASET_PATH, "utf-8"),
  );

  await documentDataSource.initialize();
  const documentRepository = new DocumentTypeormRepository(
    documentDataSource.getRepository(DocumentEntity),
  );

  let ok = 0;
  let error = 0;
  for (const experiment of cases) {
    //const experiment = cases[Math.floor(Math.random() * cases.length)];

    console.log(`Running case #${experiment.id}: "${experiment.question}"`);

    const providerRegistry = new AiProviderRegistry(
      new OpenAiProvider(),
      new AnthropicProvider(documentRepository),
    );
    const usageLogService = new AiUsageLogService(inMemoryUsageLogRepository);
    const aiCompletionService = new AiCompletionService(
      providerRegistry,
      usageLogService,
    );

    const result: ArchitectResponse = await aiCompletionService.complete({
      prompt: experiment.question,
      userId: "experiment-script",
    });

    console.log(`Result text: ${result.plainLanguageAnswer}`);
    console.log(`Expected status: ${experiment.expectedStatus}`);
    console.log(`Status: ${result.status}`);
    if (result.status == experiment.expectedStatus) {
      console.log("OK");
      ok++;
    } else {
      console.log("Error");
      error++;
    }
  }
  console.log(`Ok:${ok} Error:${error} from ${ok + error} tests`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => documentDataSource.destroy());
