export const ArchitectIntent = {
  EXPLAIN_DECISION: 'EXPLAIN_DECISION',
  EXPLAIN_TECHNICAL_CONCEPT: 'EXPLAIN_TECHNICAL_CONCEPT',
  COMPARE_DOCUMENTED_ALTERNATIVES: 'COMPARE_DOCUMENTED_ALTERNATIVES',
  LOCATE_SOURCE: 'LOCATE_SOURCE',
  REQUEST_ARCHITECTURE_CHANGE: 'REQUEST_ARCHITECTURE_CHANGE',
  REQUEST_ESTIMATE: 'REQUEST_ESTIMATE',
  MISSING_CONTEXT: 'MISSING_CONTEXT',
  CONFLICTING_CONTEXT: 'CONFLICTING_CONTEXT',
  OUT_OF_SCOPE: 'OUT_OF_SCOPE',
} as const;

export type ArchitectIntent =
  (typeof ArchitectIntent)[keyof typeof ArchitectIntent];

export const ResponseStatus = {
  ANSWERED: 'ANSWERED',
  ESCALATED: 'ESCALATED',
  REFUSED: 'REFUSED',
};

export type ResponseStatus =
  (typeof ResponseStatus)[keyof typeof ResponseStatus];

export interface EvaluationCase {
  id: string;
  projectId: string;

  question: string;

  expectedIntent: ArchitectIntent;

  expectedStatus: ResponseStatus;

  expectedDocumentIds: string[];
  referenceAnswer?: string;

  labels: string[]; // p. ej. 'adversarial', 'contradiccion', 'coloquial'

  labeledBy: string;
  datasetVersion: string;

  createdAt: Date;
}
