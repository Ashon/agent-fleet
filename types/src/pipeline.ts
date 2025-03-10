export interface PipelineNode {
  id: string
  type:
    | 'input'
    | 'plan'
    | 'decision'
    | 'action'
    | 'process'
    | 'aggregator'
    | 'analysis'
  position: { x: number; y: number }
  connectorId?: string
  data: {
    name: string
    description?: string
    config?: Record<string, unknown>
  }
}

export interface PipelineEdge {
  id: string
  source: string
  target: string
  type: 'default' | 'success' | 'error' | 'parallel' | 'async'
}

export interface Pipeline {
  id: string
  agentId: string
  name: string
  description?: string
  nodes: PipelineNode[]
  edges: PipelineEdge[]
  createdAt: Date
  updatedAt: Date
}

export interface CreatePipelinePayload {
  name: string
  agentId: string
  description?: string
  nodes: PipelineNode[]
  edges: PipelineEdge[]
}

// 파이프라인 테스트를 위한 인터페이스
export interface PipelineTestRequest {
  pipelineId: string
  input: string
}

export interface PipelineTestResponse {
  output: string
  executionPath: {
    nodeId: string
    status: 'success' | 'error'
    output: string
    timestamp: Date
  }[]
}
