import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  AiProviderName,
  type AiCompletionRequest,
  type AiCompletionResult,
  type AiProvider,
} from '../domain/ai-provider.port';
import OpenAI, { toFile } from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { DOCUMENT_REPOSITORY } from '../../document/domain/document-repository.port';
import type { DocumentRepository } from '../../document/domain/document-repository.port';
import { RetrivalStrategy } from '../domain/architect-response.model';

@Injectable()
export class OpenAiProvider implements AiProvider {
  readonly name = AiProviderName.OPENAI;
  private clientOpenAI = new OpenAI();

  constructor(
    @Inject(DOCUMENT_REPOSITORY)
    private readonly documentRepository: DocumentRepository,
  ) {}

  private async uploadDocuments(): Promise<
    OpenAI.Responses.ResponseInputFile[]
  > {
    const documents = await this.documentRepository.findAll();
    const fileBlocks: OpenAI.Responses.ResponseInputFile[] = [];
    for (const document of documents) {
      console.log(`uploading: ` + document.title);
      const uploadedFile = await this.clientOpenAI.files.create({
        file: await toFile(
          Buffer.from(document.content, 'utf-8'),
          `${document.title}.md`,
          { type: 'text/markdown' },
        ),
        purpose: 'user_data',
      });
      fileBlocks.push({
        type: 'input_file',
        file_id: uploadedFile.id,
      });
    }
    return fileBlocks;
  }

  async complete(request: AiCompletionRequest): Promise<AiCompletionResult> {
    // TODO: outputFormat only present in some models ?
    const fileBlocks =
      request.context && request.context === RetrivalStrategy.FULL_CONTEXT
        ? await this.uploadDocuments()
        : [];

    if (request.outputFormat) {
      return this.clientOpenAI.responses
        .parse({
          model: request.model ?? 'gpt-4.1',
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
              content: fileBlocks.length
                ? [
                    ...fileBlocks,
                    { type: 'input_text' as const, text: request.prompt },
                  ]
                : request.prompt,
            },
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
        model: request.model ?? 'gpt-4.1',
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
            content: fileBlocks.length
              ? [
                  ...fileBlocks,
                  { type: 'input_text' as const, text: request.prompt },
                ]
              : request.prompt,
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
