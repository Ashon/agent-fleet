export interface LLMCompletionOptions {
  maxTokens?: number
  temperature?: number
  stopSequences?: string[]
  timeout?: number
}

export interface LLMCompletionResult {
  text: string
  model: string
  tokenUsage: {
    prompt: number
    completion: number
    total: number
  }
}

export interface LLMProvider {
  complete(
    prompt: string,
    options: LLMCompletionOptions,
  ): Promise<LLMCompletionResult>
}
