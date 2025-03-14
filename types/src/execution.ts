import { PipelineNode } from './pipeline'

export interface NodeExecutionState {
  node: PipelineNode
  inDegree: number
  dependencies: Set<string>
  executed: boolean
  output?: string
}

export interface NodeExecutionResult {
  nodeId: string
  nodeName: string
  nodeType: string
  output: string
  startTime: Date
  endTime: Date
  status: 'success' | 'failed'
}

export interface PipelineExecutionRecord {
  id: string
  pipelineId: string
  pipelineName: string
  input: string
  status: 'running' | 'completed' | 'failed'
  startTime: Date
  endTime?: Date
  error?: string
  nodeResults: NodeExecutionResult[]
  finalOutput?: string
}

export interface NodeStartEvent {
  type: 'node-start'
  nodeId: string
  nodeName: string
  nodeType: string
  jobId: string
}

export interface NodeCompleteEvent {
  type: 'node-complete'
  nodeId: string
  output: string
  status: 'success'
  jobId: string
}

export interface PipelineStartEvent {
  type: 'start'
  message: string
  pipelineId: string
  pipelineName: string
  jobId: string
}

export interface PipelineCompleteEvent {
  type: 'complete'
  message: string
  pipelineId: string
  jobId: string
  finalOutput?: string
}

export interface PipelineErrorEvent {
  type: 'error'
  message: string
  pipelineId: string
  jobId: string
}

export type PipelineExecutionEvent =
  | NodeStartEvent
  | NodeCompleteEvent
  | PipelineStartEvent
  | PipelineCompleteEvent
  | PipelineErrorEvent
