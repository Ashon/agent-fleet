import { BaseEntity } from './common'

export interface PromptTemplate extends BaseEntity {
  name: string
  description?: string
  content: string
  variables: string[]
}

export interface CreatePromptTemplateDto {
  name: string
  description?: string
  content: string
  variables: string[]
}

export interface UpdatePromptTemplateDto {
  name?: string
  description?: string
  content?: string
  variables?: string[]
}

// Pipeline 노드에서 사용할 프롬프트 설정
export interface PromptNodeConfig {
  templateId: string
  variables: Record<string, string>
  contextMapping: {
    input: string[]
    output: string[]
  }
  maxTokens?: number
  temperature?: number
  stopSequences?: string[]
}

export interface PromptExecutionResult {
  templateId: string
  renderedPrompt: string
  completion: string
  tokenUsage: {
    prompt: number
    completion: number
    total: number
  }
  metadata: {
    model?: string
    executionTime?: number
    error?: string
    timestamp: string
  }
  status: 'success' | 'error'
}

// export interface NodeExecutionResult {
//   nodeId: string
//   nodeName: string
//   nodeType: string
//   input: Record<string, any>
//   output: Record<string, any>
//   startTime: Date
//   endTime: Date
//   status: 'success' | 'failed'
//   error?: string
//   metadata?: Record<string, any>
// }
