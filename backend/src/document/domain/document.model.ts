export const DocumentStatus = {
  ACTIVE: 'ACTIVE',
  SUPERSEDED: 'SUPERSEDED',
  PROPOSED: 'PROPOSED',
  ARCHIVED: 'ARCHIVED',
};

export type DocumentStatus =
  (typeof DocumentStatus)[keyof typeof DocumentStatus];

export const DocumentType = {
  ARCHITECTURE: 'ARCHITECTURE',
  ADR: 'ADR',
  TRANSCRIPT: 'TRANSCRIPT',
  PRODUCT: 'PRODUCT',
  GLOSSARY: 'GLOSSARY',
};

export type DocumentType = (typeof DocumentType)[keyof typeof DocumentType];

export interface ArchitectureDocument {
  id: string;
  projectId: string;

  title: string;
  type: DocumentType;

  version: string;

  status: DocumentStatus;

  effectiveDate?: Date;
  supersedesDocumentId?: string;

  tags: string[];
  component?: string;

  content: string;

  createdAt: Date;
  updatedAt: Date;
}
