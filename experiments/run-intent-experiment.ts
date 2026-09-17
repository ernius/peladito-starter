// Run from backend/ so dotenv picks up backend/.env (needs ANTHROPIC_API_KEY):
//   npx ts-node --transpile-only --compiler-options '{"module":"commonjs","moduleResolution":"node"}' ../experiments/run-ai-completion-service.cts
// (backend's tsconfig uses "nodenext", which ts-node can't apply to a .cts file living outside the backend project; the overrides sidestep that.)
//
// Wires AiCompletionService by hand instead of via Nest's DI container so this stays a
// standalone script with no Postgres dependency: usage logging (the only DB-backed
// collaborator) is swapped for an in-memory stub, everything else is the real service.
import "dotenv/config";
import { readFileSync } from "fs";
import { join } from "path";
import { AiCompletionService } from "../backend/src/ai/ai-completion.service";
import { AiProviderRegistry } from "../backend/src/ai/ai-provider.registry";
import { AiUsageLogService } from "../backend/src/ai/ai-usage-log.service";
import type { AiUsageLogRepository } from "../backend/src/ai/domain/ai-usage-log-repository.port";
import type { AIUsageLog } from "../backend/src/ai/domain/log.model";
import { AnthropicProvider } from "../backend/src/ai/infrastructure/anthropic.provider";
import { OpenAiProvider } from "../backend/src/ai/infrastructure/openai.provider";
import { ArchitectIntent } from "../backend/src/ai/domain/evaluation-case.model";

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

async function main(): Promise<void> {
  const cases: EvaluationCase[] = JSON.parse(
    readFileSync(DATASET_PATH, "utf-8"),
  );

  let ok = 0;
  let error = 0;
  for (const experiment of cases) {
    //const experiment = cases[Math.floor(Math.random() * cases.length)];

    console.log(`Running case #${experiment.id}: "${experiment.question}"`);

    const providerRegistry = new AiProviderRegistry(
      new OpenAiProvider(),
      new AnthropicProvider(),
    );
    const usageLogService = new AiUsageLogService(inMemoryUsageLogRepository);
    const aiCompletionService = new AiCompletionService(
      providerRegistry,
      usageLogService,
    );

    const result = await aiCompletionService.intetionClassification({
      prompt: experiment.question,
      userId: "experiment-script",
    });

    console.log(`Result: ${result.intent}`);
    console.log(`Expected: ${experiment!.expectedIntent}`);
    console.log(`Usage: ${JSON.stringify(result.usage, null, 2)}`);
    if (result.intent == experiment.expectedIntent) {
      console.log("OK");
      ok++;
    } else {
      console.log("Error");
      error++;
    }
  }
  console.log(`Ok:${ok} Error:${error} from ${ok + error} tests`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
