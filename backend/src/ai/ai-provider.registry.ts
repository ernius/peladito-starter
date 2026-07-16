import { Injectable, NotFoundException } from '@nestjs/common';
import type { AiProvider, AiProviderName } from './domain/ai-provider.port';
import { AnthropicProvider } from './infrastructure/anthropic.provider';
import { OpenAiProvider } from './infrastructure/openai.provider';

@Injectable()
export class AiProviderRegistry {
  private readonly providers: ReadonlyMap<AiProviderName, AiProvider>;

  constructor(openai: OpenAiProvider, anthropic: AnthropicProvider) {
    this.providers = new Map<AiProviderName, AiProvider>([
      [openai.name, openai],
      [anthropic.name, anthropic],
    ]);
  }

  get(name: AiProviderName): AiProvider {
    const provider = this.providers.get(name);

    if (!provider) {
      throw new NotFoundException(`AI provider ${name} is not registered`);
    }

    return provider;
  }
}
