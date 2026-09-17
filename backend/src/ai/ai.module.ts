import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiCompletionService } from './ai-completion.service';
import { AiProviderRegistry } from './ai-provider.registry';
import { AiUsageLogService } from './ai-usage-log.service';
import { AI_USAGE_LOG_REPOSITORY } from './domain/ai-usage-log-repository.port';
import { AiUsageLogEntity } from './infrastructure/ai-usage-log.entity';
import { AiUsageLogTypeormRepository } from './infrastructure/ai-usage-log-typeorm.repository';
import { AnthropicProvider } from './infrastructure/anthropic.provider';
import { OpenAiProvider } from './infrastructure/openai.provider';
import { DocumentModule } from '../document/document.module';

// Arquitectura de providers: los servicios de dominio dependen del puerto
// AiProvider (via AiProviderRegistry), nunca de un SDK concreto.
@Module({
  imports: [TypeOrmModule.forFeature([AiUsageLogEntity]), DocumentModule],
  providers: [
    OpenAiProvider,
    AnthropicProvider,
    AiProviderRegistry,
    { provide: AI_USAGE_LOG_REPOSITORY, useClass: AiUsageLogTypeormRepository },
    AiUsageLogService,
    AiCompletionService,
  ],
  exports: [AiProviderRegistry, AiUsageLogService, AiCompletionService],
})
export class AiModule {}
