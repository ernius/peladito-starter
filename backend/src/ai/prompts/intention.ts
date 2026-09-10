import { ArchitectIntent } from '../domain/evaluation-case.model';
import { Prompt } from '../domain/prompt.model';
import { z } from 'zod';

export function intentionExplanation(intention: ArchitectIntent): string {
  switch (intention) {
    case ArchitectIntent.EXPLAIN_DECISION:
      return 'recover evidence and explain a project decision';
    case ArchitectIntent.EXPLAIN_TECHNICAL_CONCEPT:
      return 'explain in non technical terms a technical concept and relate with the project';
    case ArchitectIntent.COMPARE_DOCUMENTED_ALTERNATIVES:
      return 'explain trade-offs between any project alternatives without making any decision';
    case ArchitectIntent.LOCATE_SOURCE:
      return 'locate a document, section, version and state of the project documents';
    case ArchitectIntent.REQUEST_ESTIMATE:
      return 'make a time, resources or any kind estimatation or prediction about the project';
    case ArchitectIntent.CONFLICTING_CONTEXT:
      return 'point out or expose some explicit conflict in the project';
    case ArchitectIntent.OUT_OF_SCOPE:
      return 'project boundaries or scope';
    case ArchitectIntent.MISSING_CONTEXT:
      return 'not clear intention or missing context';
  }
  return 'not clear intention or missing context';
}

const INTENTION_PROMPT_VERSION_V1 = '0.0.1';

const INTENTION_PROMPT_SYSTEM_V1 =
  'You are a software architect tasked to classify the intention of an architectural query related to the project. The possible intentions and their corresponding explanations are: ' +
  Object.values(ArchitectIntent)
    .map((i) => i + ':' + intentionExplanation(i))
    .join(', ') +
  '.';

export const INTENTIONS_SCHEMA = z.enum(Object.values(ArchitectIntent));

const IntentionClassification: Prompt = {
  version: INTENTION_PROMPT_VERSION_V1,
  prompt: INTENTION_PROMPT_SYSTEM_V1,
  outputFormat: INTENTIONS_SCHEMA,
};
