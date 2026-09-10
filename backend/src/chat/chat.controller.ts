import {
  Controller,
  Post,
  Body,
  BadGatewayException,
  BadRequestException,
  GatewayTimeoutException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

import {
  DecisionStatus,
  Confidence,
  RetrivalStrategy,
  type ArchitectResponse,
} from '../ai/domain/architect-response.model';
import { ResponseStatus } from '../ai/domain/evaluation-case.model';
import { AiProviderRegistry } from '../ai/ai-provider.registry';
import {
  AiAPIConnectionError,
  AiAPIConnectionTimeoutError,
  AiAPIError,
  AiAuthenticationError,
  AiBadRequestError,
  AiPermissionDeniedError,
  AiProviderName,
  AiRateLimitError,
  AiUnprocessableEntityError,
  AiCompletionRequest,
} from '../ai/domain/ai-provider.port';
import { AiUsageLogService } from '../ai/ai-usage-log.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/jwt.strategy';

import { explainDecisionPrompt } from '../ai/prompts/explain-decision';

export class ChatRequestDto {
  @IsString()
  @IsNotEmpty()
  prompt!: string;
  @IsOptional()
  @IsString()
  model?: string;
  @IsOptional()
  @IsNumber()
  maxTokens?: number;
}

@Controller({ path: 'chat', version: '1' })
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(
    private readonly aiProvider: AiProviderRegistry,
    private readonly aiUsageLog: AiUsageLogService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async chat(
    @Body() dto: ChatRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ArchitectResponse> {
    // TODO: configurable
    const providerName = AiProviderName.ANTHROPIC;
    const provider = this.aiProvider.get(providerName);
    const startedAt = Date.now();

    try {
      // TODO: check intetion to decide strategy RetrivalStrategy and prompt
      const req: AiCompletionRequest = {
        prompt: dto.prompt,
        model: dto.model,
        // TODO: this comes from the prompt strategy
        maxTokens: dto.maxTokens,
        outputFormat: explainDecisionPrompt.outputFormat,
        systemPrompt: explainDecisionPrompt.prompt,
        systemPromptVersion: explainDecisionPrompt.version,
      };

      const resp = await provider.complete(req);

      await this.aiUsageLog.recordChatUsage({
        userId: user.userId,
        providerName,
        model: dto.model,
        promptVersion: explainDecisionPrompt.version,
        retrievalStrategy: RetrivalStrategy.NO_RETRIEVAL,
        latencyMs: Date.now() - startedAt,
        inputTokens: resp.usage?.input_tokens ?? 0,
        outputTokens: resp.usage?.output_tokens ?? 0,
        success: true,
      });

      const archResponse: ArchitectResponse = {
        intent: 'EXPLAIN_DECISION',
        status: ResponseStatus.ANSWERED,
        plainLanguageAnswer: resp.text,
        decisionStatus: DecisionStatus.ACTIVE,
        sources: [],
        confidence: Confidence.HIGH,
      };
      return archResponse;
    } catch (err) {
      await this.aiUsageLog.recordChatUsage({
        userId: user.userId,
        providerName,
        model: dto.model,
        promptVersion: explainDecisionPrompt.version,
        retrievalStrategy: RetrivalStrategy.NO_RETRIEVAL,
        latencyMs: Date.now() - startedAt,
        inputTokens: 0,
        outputTokens: 0,
        success: false,
      });

      // Never forward the AI provider's raw error body to the client.
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
}
