import { NodeExecutionResult, PipelineNode } from '@agentfleet/types'
import { Response } from 'express'

export interface NodeExecutionContext {
  jobId: string
  response: Response
  args?: { [key: string]: any }
}

export interface NodeExecutor {
  canExecute(node: PipelineNode): boolean
  execute(
    node: PipelineNode,
    args: { [key: string]: any },
    context: NodeExecutionContext,
  ): Promise<NodeExecutionResult>
}
