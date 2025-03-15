import { NodeExecutionResult, PipelineNode } from '@agentfleet/types'
import { Response } from 'express'

export interface NodeExecutionContext {
  jobId: string
  response: Response
}

export interface NodeExecutor {
  canExecute(node: PipelineNode): boolean
  execute(
    node: PipelineNode,
    input: string,
    context: NodeExecutionContext,
  ): Promise<NodeExecutionResult>
}
