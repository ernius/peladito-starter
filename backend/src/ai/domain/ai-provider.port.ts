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
}

export interface AiCompletionResult {
  text: string;
}

export interface AiProvider {
  readonly name: AiProviderName;
  complete(request: AiCompletionRequest): Promise<AiCompletionResult>;
}
