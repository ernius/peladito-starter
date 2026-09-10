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
