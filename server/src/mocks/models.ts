import { Model } from '@agentfleet/types'

export const mockModels: Model[] = [
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'openai',
    description: '가장 발전된 OpenAI의 대규모 언어 모델',
    maxTokens: 8192,
    costPer1kTokens: 0.03,
    status: 'stable',
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    description: '빠르고 비용 효율적인 ChatGPT 모델',
    maxTokens: 4096,
    costPer1kTokens: 0.002,
    status: 'stable',
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    description: 'Anthropic의 최신 고성능 AI 모델',
    maxTokens: 200000,
    costPer1kTokens: 0.015,
    status: 'stable',
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'anthropic',
    description: '비용 효율적인 Claude 3 모델',
    maxTokens: 200000,
    costPer1kTokens: 0.003,
    status: 'stable',
  },
]

export const getModelOptions = () =>
  mockModels
    .filter((model) => model.status !== 'deprecated')
    .map((model) => ({
      value: model.id,
      label: `${model.name} (${model.provider})`,
    }))
