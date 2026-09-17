import { join } from 'path';
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
import {
  AiUsageLogService,
  RecordChatUsageParams,
} from './ai-usage-log.service';
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
  TokensUsage,
} from './domain/ai-provider.port';
import {
  ArchitectResponse,
  Confidence,
  RetrivalStrategy,
} from './domain/architect-response.model';
import { Intention, intentionClassificationPrompt } from './prompts/intention';
import { explainDecisionPrompt } from './prompts/explain-decision';
import { Prompt } from './domain/prompt.model';
import {
  ArchitectIntent,
  ResponseStatus,
} from './domain/evaluation-case.model';

export interface AiChatCompletionParams {
  prompt: string;
  userId: string;
}

export interface AiIntentResult {
  intent: ArchitectIntent;
  usage: TokensUsage;
}

// __dirname is backend/src/ai (or backend/dist/ai when built); repo root is 3 levels up.
const REPO_ROOT = join(__dirname, '..', '..', '..');

@Injectable()
export class AiCompletionService {
  private readonly logger = new Logger(AiCompletionService.name);

  constructor(
    private readonly aiProvider: AiProviderRegistry,
    private readonly aiUsageLog: AiUsageLogService,
  ) {}

  async intetionClassification(
    params: AiChatCompletionParams,
  ): Promise<AiIntentResult> {
    // TODO: configurable
    const providerName = AiProviderName.ANTHROPIC;
    const provider = this.aiProvider.get(providerName);
    const startedAt = Date.now();

    const request: AiCompletionRequest = {
      prompt: params.prompt,
      outputFormat: intentionClassificationPrompt.outputFormat,
      systemPrompt: intentionClassificationPrompt.prompt,
      systemPromptVersion: intentionClassificationPrompt.version,
      temperature: intentionClassificationPrompt.temperature,
    };

    const log = {
      userId: params.userId,
      providerName,
      model: request.model,
      promptVersion: intentionClassificationPrompt.version,
      retrievalStrategy: RetrivalStrategy.INTENT_CLASSIFICATION,
    };

    try {
      const resp = await completeWithRetry(provider, request);

      await this.aiUsageLog.recordChatUsage({
        ...log,
        latencyMs: Date.now() - startedAt,
        inputTokens: resp.usage?.input_tokens ?? 0,
        outputTokens: resp.usage?.output_tokens ?? 0,
        success: true,
      } as RecordChatUsageParams);

      return {
        intent: (resp.parsedOutput as Intention).intent,
        usage: resp.usage,
      } as AiIntentResult;
    } catch (err) {
      await this.aiUsageLog.recordChatUsage({
        ...log,
        latencyMs: Date.now() - startedAt,
        inputTokens: 0,
        outputTokens: 0,
        success: false,
      } as RecordChatUsageParams);

      this.mapError(err);
    }
  }

  async complete(params: AiChatCompletionParams): Promise<ArchitectResponse> {
    // TODO: configurable
    const providerName = AiProviderName.ANTHROPIC;
    const provider = this.aiProvider.get(providerName);

    const startedAt = Date.now();

    let request: AiCompletionRequest = {
      prompt: params.prompt,
    };

    const log = {
      userId: params.userId,
      providerName,
    };

    // TODO: implement retrival strategies
    let retrievalStrategy = RetrivalStrategy.NO_RETRIEVAL;
    let tokenUsage: TokensUsage = { input_tokens: 0, output_tokens: 0 };

    try {
      const intentRes = await this.intetionClassification(params);
      let prompt: Prompt | undefined = undefined;
      let responseStatus: ResponseStatus;
      tokenUsage = intentRes.usage;
      let escalationReason: string | undefined = undefined;

      // policies validation
      switch (intentRes.intent) {
        case ArchitectIntent.EXPLAIN_DECISION:
        case ArchitectIntent.EXPLAIN_TECHNICAL_CONCEPT:
        case ArchitectIntent.COMPARE_DOCUMENTED_ALTERNATIVES:
        case ArchitectIntent.CONFLICTING_CONTEXT:
        case ArchitectIntent.LOCATE_SOURCE:
          prompt = explainDecisionPrompt;
          responseStatus = ResponseStatus.ANSWERED;
          break;
        case ArchitectIntent.MISSING_CONTEXT:
          escalationReason = 'Missing context';
          responseStatus = ResponseStatus.REFUSED;
          break;
        case ArchitectIntent.OUT_OF_SCOPE:
          escalationReason = 'Out of scope';
          responseStatus = ResponseStatus.REFUSED;
          break;
        case ArchitectIntent.REQUEST_ARCHITECTURE_CHANGE:
          escalationReason = 'Architecture change';
          responseStatus = ResponseStatus.ESCALATED;
          break;
        case ArchitectIntent.REQUEST_ESTIMATE:
          escalationReason = 'Estimation request scope';
          responseStatus = ResponseStatus.ESCALATED;
      }

      let resp: ArchitectResponse = {
        intent: intentRes.intent,
        confidence: Confidence.LOW, // TODO
        status: responseStatus,
        sources: [], // TODO
        escalationReason,
      };

      if (prompt) {
        request = {
          ...request,
          model: prompt.model,
          outputFormat: prompt.outputFormat,
          systemPrompt: prompt.prompt,
          systemPromptVersion: prompt.version,
          temperature: prompt.temperature,
          documents: [
            join(REPO_ROOT, 'deliverable-documents/week1/corpus/v0/product.md'),
          ],
        };

        const aiComplete: AiCompletionResult = await completeWithRetry(
          provider,
          request,
        );
        tokenUsage = {
          input_tokens:
            tokenUsage.input_tokens ??
            0 + (aiComplete.usage?.input_tokens ?? 0),
          output_tokens:
            tokenUsage.output_tokens ??
            0 + (aiComplete.usage?.output_tokens ?? 0),
        };
        resp = {
          ...resp,
          sources: aiComplete.citations
            ? aiComplete.citations.map((c: string) => ({
                documentId: c,
                documentVersion: '1.0',
                section: 'todo',
              }))
            : [],
          plainLanguageAnswer: aiComplete.text,
        };
      }

      await this.aiUsageLog.recordChatUsage({
        ...log,
        latencyMs: Date.now() - startedAt,
        inputTokens: tokenUsage.input_tokens,
        outputTokens: tokenUsage.output_tokens,
        promptVersion: prompt?.version ?? 0,
        retrievalStrategy,
        success: true,
      } as RecordChatUsageParams);

      return resp;
    } catch (err) {
      await this.aiUsageLog.recordChatUsage({
        ...log,
        latencyMs: Date.now() - startedAt,
        retrievalStrategy,
        inputTokens: tokenUsage.input_tokens,
        outputTokens: tokenUsage.output_tokens,
        success: false,
      } as RecordChatUsageParams);

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
