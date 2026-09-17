import { Inject, Injectable, NotImplementedException } from '@nestjs/common';
import {
  AiProviderName,
  type AiCompletionRequest,
  type AiCompletionResult,
  type AiProvider,
  AiAPIError,
} from '../domain/ai-provider.port';
import { Anthropic, toFile } from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { DOCUMENT_REPOSITORY } from '../../document/domain/document-repository.port';
import type { DocumentRepository } from '../../document/domain/document-repository.port';
import { RetrivalStrategy } from '../domain/architect-response.model';
import { DocumentBlockParam } from '@anthropic-ai/sdk/resources';

@Injectable()
export class AnthropicProvider implements AiProvider {
  readonly name = AiProviderName.ANTHROPIC;
  private anthropicClient: Anthropic;

  constructor(
    @Inject(DOCUMENT_REPOSITORY)
    private readonly documentRepository: DocumentRepository,
  ) {
    this.anthropicClient = new Anthropic({
      apiKey: process.env['ANTHROPIC_API_KEY'],
    });
  }

  private async uploadDocuments(): Promise<Anthropic.DocumentBlockParam[]> {
    const documents = await this.documentRepository.findAll();
    const documentBlocks: Anthropic.DocumentBlockParam[] = [];
    for (const document of documents) {
      console.log(`uploading: ` + document.title);
      const uploadedFile = await this.anthropicClient.files.upload({
        file: await toFile(
          Buffer.from(document.content, 'utf-8'),
          `${document.title}.md`,
          { type: 'text/plain' },
        ),
      });
      documentBlocks.push({
        type: 'document',
        source: { type: 'file', file_id: uploadedFile.id },
        title: document.title,
        context: `This is a${document.type} type document.`,
        citations: { enabled: true },
      });
    }
    return documentBlocks;
  }

  async complete(request: AiCompletionRequest): Promise<AiCompletionResult> {
    try {
      let documentBlocks: DocumentBlockParam[] = [];
      if (
        request.context &&
        request.context === RetrivalStrategy.FULL_CONTEXT
      ) {
        documentBlocks = await this.uploadDocuments();
      }

      const content: Anthropic.MessageParam['content'] = documentBlocks.length
        ? [...documentBlocks, { type: 'text', text: request.prompt }]
        : request.prompt;

      // TODO: outputFormat only present in some models ?
      if (request.outputFormat) {
        const response = await this.anthropicClient.messages.parse({
          model: request.model ?? 'claude-sonnet-5',
          max_tokens: request.maxTokens ?? 2000, // TODO: rethink default parametrs values, move to a config file
          messages: [{ role: 'user', content }],
          ...(request.systemPrompt && { system: request.systemPrompt }),
          ...(request.temperature && { temperature: request.temperature }),
          output_config: { format: zodOutputFormat(request.outputFormat) },
        });
        return {
          parsedOutput: response.parsed_output as object,
          usage: response.usage,
        };
      }

      const response = await this.anthropicClient.messages.create({
        model: request.model ?? 'claude-sonnet-5',
        max_tokens: request.maxTokens ?? 2000, // TODO: rethink default parametrs values, move to a config file
        messages: [{ role: 'user', content }],
        ...(request.systemPrompt && { system: request.systemPrompt }),
      });
      for (const block of response.content) {
        if (block.type === 'text') {
          return {
            text: block.text,
            citations: block.citations?.map((citation) => citation.cited_text),
            usage: response.usage,
          };
        }
      }
      throw new NotImplementedException(
        'Anthropic no text response handling not implemented yet !',
      );
    } catch (err) {
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
    }
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
