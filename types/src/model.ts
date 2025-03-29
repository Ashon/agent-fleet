import { BaseEntity } from './common'

export interface ModelConfig extends BaseEntity {
  name: string
  provider: 'openai' | 'anthropic' | 'google' | 'ollama'
  description: string
  maxTokens: number
  status: 'active' | 'inactive'
}
