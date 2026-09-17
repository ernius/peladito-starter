import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DocumentStatus, DocumentType } from '../domain/document.model';

@Entity('documents')
export class DocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_documents_project_id')
  @Column({ name: 'project_id', length: 120 })
  projectId!: string;

  @Column({ name: 'title', length: 255 })
  title!: string;

  @Column({ name: 'type', type: 'varchar', length: 20 })
  type!: DocumentType;

  @Column({ name: 'version', length: 40 })
  version!: string;

  @Column({ name: 'status', type: 'varchar', length: 20 })
  status!: DocumentStatus;

  @Column({ name: 'effective_date', type: 'timestamptz', nullable: true })
  effectiveDate!: Date | null;

  @Index('idx_documents_supersedes_document_id')
  @Column({ name: 'supersedes_document_id', type: 'uuid', nullable: true })
  supersedesDocumentId!: string | null;

  @Column({ name: 'tags', type: 'text', array: true, default: '{}' })
  tags!: string[];

  @Column({ name: 'component', type: 'varchar', length: 120, nullable: true })
  component!: string | null;

  @Column({ name: 'content', type: 'text' })
  content!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz' })
  deletedAt!: Date | null;
}
