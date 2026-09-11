import {
  BadGatewayException,
  BadRequestException,
  GatewayTimeoutException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AiProviderRegistry } from './ai-provider.registry';
import { AiUsageLogService } from './ai-usage-log.service';
import {
  AiAPIConnectionError,
  AiAPIConnectionTimeoutError,
  AiAPIError,
  AiAuthenticationError,
  AiBadRequestError,
  type AiCompletionRequest,
  type AiCompletionResult,
  AiPermissionDeniedError,
  AiProviderName,
  AiRateLimitError,
  AiUnprocessableEntityError,
  completeWithRetry,
} from './domain/ai-provider.port';
import { RetrivalStrategy } from './domain/architect-response.model';
import { explainDecisionPrompt } from './prompts/explain-decision';

export interface AiChatCompletionParams {
  prompt: string;
  userId: string;
}

@Injectable()
export class AiCompletionService {
  private readonly logger = new Logger(AiCompletionService.name);

  constructor(
    private readonly aiProvider: AiProviderRegistry,
    private readonly aiUsageLog: AiUsageLogService,
  ) {}

  async complete(params: AiChatCompletionParams): Promise<AiCompletionResult> {
    // TODO: configurable
    const providerName = AiProviderName.ANTHROPIC;
    const provider = this.aiProvider.get(providerName);

    // TODO: check intetion to decide strategy RetrivalStrategy and prompt
    const retrievalStrategy = RetrivalStrategy.NO_RETRIEVAL;

    const startedAt = Date.now();

    const request: AiCompletionRequest = {
      prompt: params.prompt,
      outputFormat: explainDecisionPrompt.outputFormat,
      systemPrompt: explainDecisionPrompt.prompt,
      systemPromptVersion: explainDecisionPrompt.version,
      temperature: explainDecisionPrompt.temperature,
    };

    try {
      const resp = await completeWithRetry(provider, request);

      await this.aiUsageLog.recordChatUsage({
        userId: params.userId,
        providerName,
        model: request.model,
        promptVersion: explainDecisionPrompt.version,
        retrievalStrategy,
        latencyMs: Date.now() - startedAt,
        inputTokens: resp.usage?.input_tokens ?? 0,
        outputTokens: resp.usage?.output_tokens ?? 0,
        success: true,
      });

      return resp;
    } catch (err) {
      await this.aiUsageLog.recordChatUsage({
        userId: params.userId,
        providerName,
        model: request.model,
        promptVersion: explainDecisionPrompt.version,
        retrievalStrategy,
        latencyMs: Date.now() - startedAt,
        inputTokens: 0,
        outputTokens: 0,
        success: false,
      });

      this.mapError(err);
    }
  }

  // Never forward the AI provider's raw error body to the client.
  private mapError(err: unknown): never {
    console.log(err);
    if (
      err instanceof AiBadRequestError ||
      err instanceof AiUnprocessableEntityError
    ) {
      throw new BadRequestException(
        'The AI provider rejected the request',
        err.message,
      );
    }

    if (
      err instanceof AiAuthenticationError ||
      err instanceof AiPermissionDeniedError
    ) {
      this.logger.error('AI provider authentication failed', err.stack);
      throw new BadGatewayException('AI provider is misconfigured');
    }

    if (err instanceof AiRateLimitError) {
      throw new HttpException(
        'AI provider rate limit exceeded, please try again later',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (err instanceof AiAPIConnectionTimeoutError) {
      throw new GatewayTimeoutException('AI provider request timed out');
    }

    if (err instanceof AiAPIConnectionError) {
      throw new ServiceUnavailableException('AI provider is unreachable');
    }

    if (err instanceof AiAPIError) {
      this.logger.error('AI provider request failed', err.stack);
      throw new BadGatewayException('AI provider request failed');
    }

    if (err instanceof HttpException) {
      throw err;
    }

    this.logger.error(
      'Unexpected error completing chat request',
      err instanceof Error ? err.stack : err,
    );
    throw new InternalServerErrorException('Unable to process chat request');
  }
}
