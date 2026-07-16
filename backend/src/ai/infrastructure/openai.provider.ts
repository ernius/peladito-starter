import { Injectable, NotImplementedException } from '@nestjs/common';
import {
  AiProviderName,
  type AiCompletionRequest,
  type AiCompletionResult,
  type AiProvider,
} from '../domain/ai-provider.port';

@Injectable()
export class OpenAiProvider implements AiProvider {
  readonly name = AiProviderName.OPENAI;

  // TODO(participante): integrar el SDK de OpenAI (semana 2).
  complete(_request: AiCompletionRequest): Promise<AiCompletionResult> {
    throw new NotImplementedException('OpenAI provider not implemented yet');
  }
}
