import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  AiProviderName,
  type AiCompletionRequest,
  type AiCompletionResult,
  type AiProvider,
} from '../domain/ai-provider.port';
import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import fs from 'fs';

@Injectable()
export class OpenAiProvider implements AiProvider {
  readonly name = AiProviderName.OPENAI;
  private clientOpenAI = new OpenAI();

  complete(request: AiCompletionRequest): Promise<AiCompletionResult> {

    // TODO: use File Search, upload files
    let documents = [];
    for (const document in request.documents) {
      const data = fs.readFileSync(document);
      const base64String = data.toString('base64');
      documents.push({
        type: 'input_file',
        filename: document,
        file_data: `data:text/markdown;base64,${base64String}`,        
      }
    }
    // TODO: outputFormat only present in some models ?
    if (request.outputFormat) {
      return this.clientOpenAI.responses
        .parse({
          model: request.model ?? 'gpt-6-astra',
          ...(request.maxTokens && { max_output_tokens: request.maxTokens }),
          input: [
            ...(request.systemPrompt
              ? [
                  {
                    role: 'system' as const,
                    content: request.systemPrompt,
                  },
                ]
              : []),
            {
              role: 'user' as const,
              content: request.prompt,
            },
            ...documents,
          ],
          text: { format: zodTextFormat(request.outputFormat, 'output') },
        })
        .then((response) => {
          return {
            parsedOutput: response.output_parsed as object,
            usage: {
              input_tokens: response.usage?.input_tokens,
              output_tokens: response.usage?.output_tokens,
            },
          };
        })
        .catch((err) => {
          throw new InternalServerErrorException(`OpenAI error ${err}`);
        });
    }
    return this.clientOpenAI.responses
      .create({
        model: request.model ?? 'gpt-6-astra',
        ...(request.maxTokens && { masx_output_tokens: request.maxTokens }),
        input: [
          ...(request.systemPrompt
            ? [
                {
                  role: 'system' as const, // TODO: check this or use instruction field ?
                  content: request.systemPrompt,
                },
              ]
            : []),
          {
            role: 'user' as const,
            content: request.prompt,
          },
        ],
      })
      .then((response) => {
        return {
          text: response.output_text,
          usage: {
            input_tokens: response.usage?.input_tokens,
            output_tokens: response.usage?.output_tokens,
          },
        };
      })
      .catch((err) => {
        throw new InternalServerErrorException(`OpenAI error ${err}`);
      });
  }

  isRetryable(err: unknown): boolean {
    if (err instanceof OpenAI.APIConnectionError) {
      return true;
    } else if (err instanceof OpenAI.RateLimitError) {
      return true;
    } else if (err instanceof OpenAI.APIError) {
      return false;
    }
    return false;
  }
}
