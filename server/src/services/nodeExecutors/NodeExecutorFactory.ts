import { PipelineNode } from '@agentfleet/types'
import { NodeExecutor } from './NodeExecutor'

export class NodeExecutorFactory {
  private executors: NodeExecutor[] = []

  registerExecutor(executor: NodeExecutor): void {
    this.executors.push(executor)
  }

  getExecutor(node: PipelineNode): NodeExecutor {
    const executor = this.executors.find((e) => e.canExecute(node))
    if (!executor) {
      throw new Error(`${node.type} type node executor not found`)
    }
    return executor
  }
}
