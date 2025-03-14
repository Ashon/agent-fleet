export interface Model {
  id: string
  name: string
  provider: 'openai' | 'anthropic' | 'google'
  description: string
  maxTokens: number
  costPer1kTokens: number
  status: 'stable' | 'beta' | 'deprecated'
}
