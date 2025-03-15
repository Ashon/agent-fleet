import { BaseEntity } from './common'
import { PromptNodeConfig } from './prompt'

export type PipelineNodeType =
  | 'input'
  | 'plan'
  | 'decision'
  | 'action'
  | 'process'
  | 'aggregator'
  | 'analysis'
  | 'prompt'

export interface PipelineNodeData {
  name: string
  description?: string
  config?: PromptNodeConfig
}

export interface PipelineNode {
  id: string
  type: PipelineNodeType
  position: { x: number; y: number }
  connectorId?: string
  data: PipelineNodeData
}

export interface PipelineEdge {
  id: string
  source: string
  target: string
  type: 'default' | 'success' | 'error' | 'parallel' | 'async'
}

export interface Pipeline extends BaseEntity {
  agentId: string
  name: string
  description?: string
  nodes: PipelineNode[]
  edges: PipelineEdge[]
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
