import { ArchitectIntent, ResponseStatus } from './evaluation-case.model';
import { z } from 'zod';

export const DecisionStatus = {
  ACTIVE: 'ACTIVE',
  SUPERSEDED: 'SUPERSEDED',
  PROPOSED: 'PROPOSED',
  UNKNOWN: 'UNKNOWN',
};

export type DecisionStatus =
  (typeof DecisionStatus)[keyof typeof DecisionStatus];

export const Confidence = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
};

export type Confidence = (typeof Confidence)[keyof typeof Confidence];

export interface Document {
  documentId: string;
  documentVersion: string;
  section: string;
  excerpt?: string;
}

export const RetrivalStrategy = {
  NO_RETRIEVAL: 'NO_RETRIEVAL',
  FULL_CONTEXT: 'FULL_CONTEXT',
  EXACT_LOOKUP: 'EXACT_LOOKUP',
  MANAGED_FILE_SEARCH: 'MANAGED_FILE_SEARCH',
  CUSTOM_RAG: 'CUSTOM_RAG',
  HYBRID: 'HYBRID',
  INTENT_CLASSIFICATION: 'SENTIMENT_CLASSIFICATION',
} as const;

export type RetrivalStrategy =
  (typeof RetrivalStrategy)[keyof typeof RetrivalStrategy];

export interface ArchitectResponse {
  intent: ArchitectIntent;

  status: ResponseStatus;

  plainLanguageAnswer?: string;

  // extra info for debugging trying to explain the answer
  technicalExplanation?: string;

  decisionStatus?: DecisionStatus;

  sources: Array<Document>;

  confidence: Confidence;

  escalationReason?: string;
}

// Models responses sturctured outputs
export const IntentResponse = z.object({
  intent: z.enum(ArchitectIntent),
});

export const ModelResponse = z.object({
  answer: z.string(),
  anwerExplanation: z.string(),
  sources: z.array(z.string()),
});
