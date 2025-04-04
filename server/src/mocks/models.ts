import { ModelConfig } from '@agentfleet/types'

export const mockModels: ModelConfig[] = [
  {
    id: 'ollama-gemma3',
    name: 'Gemma3',
    provider: 'ollama',
    description: 'Ollama Gemma3',
    maxTokens: 8192,
    status: 'active',
    createdAt: new Date('2024-03-15T09:00:00.000Z').toISOString(),
    updatedAt: new Date('2024-03-15T09:00:00.000Z').toISOString(),
  },
  // {
  //   id: 'gpt-3.5-turbo',
  //   name: 'GPT-3.5 Turbo',
  //   provider: 'openai',
  //   description: '빠르고 비용 효율적인 ChatGPT 모델',
  //   maxTokens: 4096,
  //   costPer1kTokens: 0.002,
  //   status: 'stable',
  //   createdAt: new Date('2024-03-15T09:00:00.000Z').toISOString(),
  //   updatedAt: new Date('2024-03-15T09:00:00.000Z').toISOString(),
  // },
  // {
  //   id: 'claude-3-opus',
  //   name: 'Claude 3 Opus',
  //   provider: 'anthropic',
  //   description: 'Anthropic의 최신 고성능 AI 모델',
  //   maxTokens: 200000,
  //   costPer1kTokens: 0.015,
  //   status: 'stable',
  //   createdAt: new Date('2024-03-15T09:00:00.000Z').toISOString(),
  //   updatedAt: new Date('2024-03-15T09:00:00.000Z').toISOString(),
  // },
  // {
  //   id: 'claude-3-sonnet',
  //   name: 'Claude 3 Sonnet',
  //   provider: 'anthropic',
  //   description: '비용 효율적인 Claude 3 모델',
  //   maxTokens: 200000,
  //   costPer1kTokens: 0.003,
  //   status: 'stable',
  //   createdAt: new Date('2024-03-15T09:00:00.000Z').toISOString(),
  //   updatedAt: new Date('2024-03-15T09:00:00.000Z').toISOString(),
  // },
]
