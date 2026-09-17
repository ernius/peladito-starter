import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DOCUMENT_REPOSITORY } from './domain/document-repository.port';
import { DocumentEntity } from './infrastructure/document.entity';
import { DocumentTypeormRepository } from './infrastructure/document-typeorm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentEntity])],
  providers: [
    {
      provide: DOCUMENT_REPOSITORY,
      useClass: DocumentTypeormRepository,
    },
  ],
  exports: [DOCUMENT_REPOSITORY],
})
export class DocumentModule {}
