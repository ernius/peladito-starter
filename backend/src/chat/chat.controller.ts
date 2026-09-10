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
} from '@nestjs/common';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

import {
  DecisionStatus,
  Confidence,
  type ArchitectResponse,
} from '../ai/domain/architect-response.model';
import { ResponseStatus } from 'src/ai/domain/evaluation-case.model';
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
} from '../ai/domain/ai-provider.port';

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

  constructor(private readonly aiProvider: AiProviderRegistry) {}

  @Post()
  async chat(@Body() dto: ChatRequestDto): Promise<ArchitectResponse> {
    const provider = this.aiProvider.get(AiProviderName.ANTHROPIC);

    try {
      const resp = await provider.complete(dto);
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
      // Never forward the AI provider's raw error body to the client.
      if (
        err instanceof AiBadRequestError ||
        err instanceof AiUnprocessableEntityError
      ) {
        throw new BadRequestException('The AI provider rejected the request');
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
