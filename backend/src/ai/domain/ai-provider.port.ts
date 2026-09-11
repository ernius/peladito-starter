import retry from 'async-retry';
import { ZodType } from 'zod/v4';

export const AiProviderName = {
  OPENAI: 'OPENAI',
  ANTHROPIC: 'ANTHROPIC',
} as const;

export type AiProviderName =
  (typeof AiProviderName)[keyof typeof AiProviderName];

// TODO(participante): este contrato es un punto de partida deliberadamente
// mínimo. Evolucionarlo — system prompt, parámetros, structured outputs,
// tokens, costo, latencia — es parte del trabajo de la semana 2.
export interface AiCompletionRequest {
  prompt: string;
  // parameters
  model?: string;
  maxTokens?: number;
  outputFormat?: ZodType;
  // prompt
  systemPrompt?: string;
  systemPromptVersion?: string;
  // files
  documents?: [string];
}

export interface AiCompletionResult {
  text?: string;
  parsedOutput?: object;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
  };
}

export type APIErrorType =
  | 'invalid_request_error'
  | 'authentication_error'
  | 'permission_error'
  | 'not_found_error'
  | 'rate_limit_error'
  | 'timeout_error'
  | 'overloaded_error'
  | 'api_error'
  | 'billing_error';

export class AiError extends Error {}

export class AiAPIError extends AiError {
  // HTTP status
  readonly status: number;
  readonly headers: Headers;
  readonly error: object;
  readonly type?: APIErrorType;

  // Ai session
  readonly requestID?: string;

  constructor(
    status: number,
    error: object,
    message: string,
    headers: Headers,
    type?: APIErrorType,
  ) {
    super(`${AiAPIError.makeMessage(status, error, message)}`);
    this.status = status;
    this.headers = headers;
    this.error = error;
    this.type = type ?? undefined;
    this.requestID = headers?.get('request-id') ?? undefined;
  }

  private static makeMessage(status: number, error: any, message: string) {
    const msg = error?.message
      ? typeof error.message === 'string'
        ? error.message
        : JSON.stringify(error.message)
      : error
        ? JSON.stringify(error)
        : message;

    if (status && msg) {
      return `${status} ${msg}`;
    }
    if (status) {
      return `${status} status code (no body)`;
    }
    if (msg) {
      return msg;
    }
    return '(no status code or body)';
  }

  static generate(
    status: number,
    errorResponse: object,
    message: string,
    headers: Headers,
  ): AiAPIError {
    const error = errorResponse as Record<string, any>;
    const type = error?.['error']?.['type'] as APIErrorType | undefined;

    if (status === 400) {
      return new AiBadRequestError(status, error, message, headers, type);
    }

    if (status === 401) {
      return new AiAuthenticationError(status, error, message, headers, type);
    }

    if (status === 403) {
      return new AiPermissionDeniedError(status, error, message, headers, type);
    }

    if (status === 404) {
      return new AiNotFoundError(status, error, message, headers, type);
    }

    if (status === 409) {
      return new AiConflictError(status, error, message, headers, type);
    }

    if (status === 422) {
      return new AiUnprocessableEntityError(
        status,
        error,
        message,
        headers,
        type,
      );
    }

    if (status === 429) {
      return new AiRateLimitError(status, error, message, headers, type);
    }

    if (status >= 500) {
      return new AiInternalServerError(status, error, message, headers, type);
    }

    return new AiAPIError(status, error, message, headers, type);
  }
}

export class AiBadRequestError extends AiAPIError {}

export class AiAuthenticationError extends AiAPIError {}

export class AiPermissionDeniedError extends AiAPIError {}

export class AiNotFoundError extends AiAPIError {}

export class AiConflictError extends AiAPIError {}

export class AiUnprocessableEntityError extends AiAPIError {}

export class AiRateLimitError extends AiAPIError {}

export class AiInternalServerError extends AiAPIError {}

export class AiAPIConnectionError extends AiError {
  constructor({
    message,
    cause,
  }: {
    message?: string | undefined;
    cause?: Error | undefined;
  }) {
    super(message || 'Connection error.', undefined);
    // in some environments the 'cause' property is already declared
    // @ts-ignore
    if (cause) this.cause = cause;
  }
}

export class AiAPIConnectionTimeoutError extends AiError {
  constructor({ message }: { message?: string } = {}) {
    super(message ?? 'Request timed out.');
  }
}

export interface AiProvider {
  readonly name: AiProviderName;
  complete(request: AiCompletionRequest): Promise<AiCompletionResult>;
  isRetryable(err: unknown): boolean;
}

export function completeWithRetry(
  provider: AiProvider,
  request: AiCompletionRequest,
): Promise<AiCompletionResult> {
  return retry(
    async (bail) => {
      try {
        return await provider.complete(request);
      } catch (err) {
        if (!provider.isRetryable(err)) {
          bail(err); // not retraible stop attempting
          return;
        }
        throw err; // trigger a retry
      }
    },
    {
      // TODO: get from configuration
      retries: 2,
      factor: 2, // Exponential backoff multiplier
      minTimeout: 1000, // First retry waits 1s
      maxTimeout: 8000, // Maximum wait capped at 8s
    },
  );
}
