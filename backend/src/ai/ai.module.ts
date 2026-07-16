import { Module } from '@nestjs/common';
import { AiProviderRegistry } from './ai-provider.registry';
import { AnthropicProvider } from './infrastructure/anthropic.provider';
import { OpenAiProvider } from './infrastructure/openai.provider';

// Arquitectura de providers: los servicios de dominio dependen del puerto
// AiProvider (via AiProviderRegistry), nunca de un SDK concreto.
@Module({
  providers: [OpenAiProvider, AnthropicProvider, AiProviderRegistry],
  exports: [AiProviderRegistry],
})
export class AiModule {}
