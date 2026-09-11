import { Prompt } from '../domain/prompt.model';
//import { z } from 'zod';

const EXPLAIN_DECISION_PROMPT_VERSION_V1 = '0.0.1';

const EXPLAIN_DECISION_PROMPT_SYSTEM_V1 =
  'You are a software architect tasked to explain an architectural decision in the project. Decision can be registered in ADR documents and specified directly in technical documents.';

//export const EXPLAIN_DECISION_SCHEMA_V1 = z.enum(Object.values(ArchitectIntent));

export const explainDecisionPrompt: Prompt = {
  version: EXPLAIN_DECISION_PROMPT_VERSION_V1,
  prompt: EXPLAIN_DECISION_PROMPT_SYSTEM_V1,
  //outputFormat: INTENTIONS_SCHEMA,
};
