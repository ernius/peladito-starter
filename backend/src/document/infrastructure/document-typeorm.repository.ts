import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type {
  ArchitectureDocument,
  DocumentStatus,
} from '../domain/document.model';
import type { DocumentRepository } from '../domain/document-repository.port';
import { DocumentEntity } from './document.entity';

@Injectable()
export class DocumentTypeormRepository implements DocumentRepository {
  constructor(
    @InjectRepository(DocumentEntity)
    private readonly repository: Repository<DocumentEntity>,
  ) {}

  async findAll(): Promise<ArchitectureDocument[]> {
    const entities = await this.repository.find();
    return entities.map((entity) => this.toDomain(entity));
  }

  async findById(id: string): Promise<ArchitectureDocument | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByProjectId(projectId: string): Promise<ArchitectureDocument[]> {
    const entities = await this.repository.find({ where: { projectId } });
    return entities.map((entity) => this.toDomain(entity));
  }

  async findByStatus(status: DocumentStatus): Promise<ArchitectureDocument[]> {
    const entities = await this.repository.find({ where: { status } });
    return entities.map((entity) => this.toDomain(entity));
  }

  async create(
    data: Omit<ArchitectureDocument, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ArchitectureDocument> {
    const entity = await this.repository.save(
      this.repository.create({
        ...data,
        effectiveDate: data.effectiveDate ?? null,
        supersedesDocumentId: data.supersedesDocumentId ?? null,
        component: data.component ?? null,
      }),
    );
    return this.toDomain(entity);
  }

  async update(
    id: string,
    data: Partial<
      Omit<ArchitectureDocument, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>
    >,
  ): Promise<ArchitectureDocument | null> {
    const entity = await this.repository.preload({ id, ...data });
    if (!entity) {
      return null;
    }
    return this.toDomain(await this.repository.save(entity));
  }

  private toDomain(entity: DocumentEntity): ArchitectureDocument {
    return {
      id: entity.id,
      projectId: entity.projectId,
      title: entity.title,
      type: entity.type,
      version: entity.version,
      status: entity.status,
      effectiveDate: entity.effectiveDate ?? undefined,
      supersedesDocumentId: entity.supersedesDocumentId ?? undefined,
      tags: entity.tags,
      component: entity.component ?? undefined,
      content: entity.content,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
