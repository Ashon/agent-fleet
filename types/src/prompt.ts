import { BaseEntity } from './common'

export interface Prompt extends BaseEntity {
  name: string
  description?: string
  content: string
  variables: string[]
}

export interface CreatePromptDto {
  name: string
  description?: string
  content: string
  variables: string[]
}

export interface UpdatePromptDto {
  name?: string
  description?: string
  content?: string
  variables?: string[]
}

// Pipeline 노드에서 사용할 프롬프트 설정
export interface PromptNodeConfig {
  promptId: string
  contextSources?: {
    type: 'connector' | 'memory' | 'knowledge-base'
    connectorId?: string // 외부 시스템 연동을 위한 커넥터 ID
    config?: {
      query?: string // 데이터 조회를 위한 쿼리
      filters?: Record<string, unknown> // 데이터 필터링 조건
      options?: Record<string, unknown> // 기타 설정
    }
  }[]
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
  promptId: string
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
