export interface LLMCompletionResult {
  text: string
  json?: Record<string, any>
  thinking?: string
  model: string
  prompt: string
  tokenUsage: {
    prompt: number
    completion: number
    total: number
  }
  meta?: {
    [key: string]: any
  }
}
