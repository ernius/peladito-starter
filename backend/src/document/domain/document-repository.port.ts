import type { ArchitectureDocument, DocumentStatus } from './document.model';

export const DOCUMENT_REPOSITORY = Symbol('DOCUMENT_REPOSITORY');

export interface DocumentRepository {
  findById(id: string): Promise<ArchitectureDocument | null>;
  findByProjectId(projectId: string): Promise<ArchitectureDocument[]>;
  findByStatus(status: DocumentStatus): Promise<ArchitectureDocument[]>;
  create(
    data: Omit<ArchitectureDocument, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ArchitectureDocument>;
  update(
    id: string,
    data: Partial<
      Omit<ArchitectureDocument, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>
    >,
  ): Promise<ArchitectureDocument | null>;
}
