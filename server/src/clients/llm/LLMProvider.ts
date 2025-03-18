import { LLMCompletionResult } from '@agentfleet/types'

export interface LLMCompletionOptions {
  maxTokens?: number
  temperature?: number
  stopSequences?: string[]
  timeout?: number
}

export interface LLMProvider {
  complete(
    prompt: string,
    options: LLMCompletionOptions,
  ): Promise<LLMCompletionResult>
}
