import { Injectable, NotImplementedException } from '@nestjs/common';
import {
  AiProviderName,
  type AiCompletionRequest,
  type AiCompletionResult,
  type AiProvider,
} from '../domain/ai-provider.port';

@Injectable()
export class AnthropicProvider implements AiProvider {
  readonly name = AiProviderName.ANTHROPIC;

  // TODO(participante): integrar el SDK de Anthropic (semana 2).
  complete(_request: AiCompletionRequest): Promise<AiCompletionResult> {
    throw new NotImplementedException('Anthropic provider not implemented yet');
  }
}
