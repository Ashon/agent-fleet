export interface WorkflowNode {
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

export interface WorkflowEdge {
  id: string
  source: string
  target: string
  type: 'default' | 'success' | 'error'
}

export interface Workflow {
  id: string
  agentId: string
  name: string
  description?: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  createdAt: Date
  updatedAt: Date
}

export interface CreateWorkflowData {
  name: string
  description?: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
}
