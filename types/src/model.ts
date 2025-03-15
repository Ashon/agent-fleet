import { BaseEntity } from './common'

export interface Model extends BaseEntity {
  name: string
  provider: 'openai' | 'anthropic' | 'google'
  description: string
  maxTokens: number
  costPer1kTokens: number
  status: 'stable' | 'beta' | 'deprecated'
}
