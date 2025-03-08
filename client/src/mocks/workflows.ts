export interface WorkflowNode {
  id: string
  type: 'start' | 'input' | 'process' | 'output' | 'end'
  connectorId?: string
  position: { x: number; y: number }
  data: {
    label: string
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
  description: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
}
