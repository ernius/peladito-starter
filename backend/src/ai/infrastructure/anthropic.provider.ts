import { Injectable, NotImplementedException } from '@nestjs/common';
import {
  AiProviderName,
  type AiCompletionRequest,
  type AiCompletionResult,
  type AiProvider,
  AiAPIError,
} from '../domain/ai-provider.port';

import { Anthropic } from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';

@Injectable()
export class AnthropicProvider implements AiProvider {
  readonly name = AiProviderName.ANTHROPIC;
  private anthropicClient: Anthropic;

  constructor() {
    this.anthropicClient = new Anthropic({
      apiKey: process.env['ANTHROPIC_API_KEY'],
    });
  }

  complete(request: AiCompletionRequest): Promise<AiCompletionResult> {
    // TODO: previously upload all corpus files files.upload ?

    // TODO: outputFormat only present in some models ?
    if (request.outputFormat) {
      return this.anthropicClient.messages
        .parse({
          model: request.model ?? 'claude-opus-4-5',
          max_tokens: request.maxTokens ?? 100, // TODO: rethink default parametrs values, move to a config file
          messages: [{ role: 'user', content: request.prompt }],
          ...(request.systemPrompt && { system: request.systemPrompt }),
          output_config: { format: zodOutputFormat(request.outputFormat) },
        })
        .then((response) => {
          return {
            parsedOutput: response.parsed_output as object,
            usage: response.usage,
          };
        })
        .catch(async (err) => {
          if (err instanceof Anthropic.APIError) {
            throw AiAPIError.generate(
              err.status,
              err.error,
              err.message,
              err.headers,
            );
          } else {
            throw err;
          }
        });
    }
    return this.anthropicClient.messages
      .create({
        model: request.model ?? 'claude-opus-4-5',
        max_tokens: request.maxTokens ?? 100, // TODO: rethink default parametrs values, move to a config file
        messages: [{ role: 'user', content: request.prompt }],
        ...(request.systemPrompt && { system: request.systemPrompt }),
      })
      .then((response) => {
        for (const block of response.content) {
          if (block.type === 'text') {
            return {
              text: block.text,
              usage: response.usage,
            };
          }
        }
        throw new NotImplementedException(
          'Anthropic no text response handling not implemented yet !',
        );
      })
      .catch(async (err) => {
        if (err instanceof Anthropic.APIError) {
          throw AiAPIError.generate(
            err.status,
            err.error,
            err.message,
            err.headers,
          );
        } else {
          throw err;
        }
      });
  }

  isRetryable(err: unknown): boolean {
    if (err instanceof Anthropic.APIConnectionTimeoutError) return true;
    if (err instanceof Anthropic.APIConnectionError) return true;
    if (err instanceof Anthropic.APIError) {
      if (err.status === 429) return true;
      if (err.status && err.status >= 500) return true;
      return false;
    }
    return false;
  }
}
