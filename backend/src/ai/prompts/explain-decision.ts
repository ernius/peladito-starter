import { Prompt } from '../domain/prompt.model';
import { z } from 'zod';

const EXPLAIN_DECISION_PROMPT_VERSION_V1 = '0.0.1';

const EXPLAIN_DECISION_PROMPT_SYSTEM_V1 =
  'You are a software architect tasked to explain an architectural decision in the project. There are various types of documents: ADR type documents are used to register decisions, ARCHITECTURE type documents specify the architecture of the system, PRODUCT type documents have descriptions and specifications of the system behavior and scope, GLOSSARY types documents have terminology definitions and nomenclature related to the system. Reference the documents and its section where decision is made or related information related to the input query. Structure the response giving the response in "text" output field, and the documents used for the response elaboration in "sources" output field, for each document referenced you should put the document name in "document_name" field, and the section title, text fragment used, or some kind of description about where in the document is the relevant information in "section" field.';

export const EXPLAIN_DECISION_SCHEMA_V1 = z.object({
  text: z.string(),
  sources: z.array(
    z.object({
      document_name: z.string(),
      section: z.string(),
    }),
  ),
});

export type ExplainDecision = z.infer<typeof EXPLAIN_DECISION_SCHEMA_V1>;

export const explainDecisionPrompt: Prompt = {
  version: EXPLAIN_DECISION_PROMPT_VERSION_V1,
  prompt: EXPLAIN_DECISION_PROMPT_SYSTEM_V1,
  outputFormat: EXPLAIN_DECISION_SCHEMA_V1,
};
