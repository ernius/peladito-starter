import { ZodType } from 'zod/v4';
import { AiProviderName } from './ai-provider.port';

export interface Prompt {
  model?: string;
  provider?: AiProviderName;
  outputFormat?: ZodType;
  version: string;
  prompt: string;
}
