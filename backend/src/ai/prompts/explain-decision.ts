import { Prompt } from '../domain/prompt.model';
//import { z } from 'zod';

const EXPLAIN_DECISION_PROMPT_VERSION_V1 = '0.0.1';

const EXPLAIN_DECISION_PROMPT_SYSTEM_V1 =
  'You are a software architect tasked to explain an architectural decision in the project. There are various types of documents: ADR type documents are used to register decisions, ARCHITECTURE type documents specify the architecture of the system, PRODUCT type documents have descriptions and specifications of the system behavior and scope, GLOSSARY types documents have terminology definitions and nomenclature related to the system. Reference the documents and its section where decision is made or related information related to the input query.';

//export const EXPLAIN_DECISION_SCHEMA_V1 = z.enum(Object.values(ArchitectIntent));

export const explainDecisionPrompt: Prompt = {
  model: 'claude-sonnet-5',
  version: EXPLAIN_DECISION_PROMPT_VERSION_V1,
  prompt: EXPLAIN_DECISION_PROMPT_SYSTEM_V1,
  //outputFormat: INTENTIONS_SCHEMA,
};
