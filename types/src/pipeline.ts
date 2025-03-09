export interface PipelineNode {
  id: string
  type: 'start' | 'input' | 'process' | 'output' | 'end'
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
  type: 'default' | 'success' | 'error'
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
